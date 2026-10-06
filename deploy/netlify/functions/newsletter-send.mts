import type { Config } from "@netlify/functions";
import { and, eq, gte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { newsletterArticles, newsletterBatches, newsletterDeliveries } from "../../db/schema.js";
import { renderArticleEmail } from "../lib/newsletter-emails.js";
import { articlePicks, readFeed, type FeedItem } from "../lib/newsletter-feed.js";
import {
  LOCALES,
  REPLY_TO,
  SENDER,
  incompleteBatchIds,
  pendingWelcomes,
  rebuildMissingSegments,
  remainingToday,
  resend,
  sendWelcome,
  syncSubscriber,
  unsyncedSubscribers,
  type Locale,
} from "../lib/newsletter.js";

// The hourly newsletter run. In order:
//
//   0. Rebuilds any batch whose Resend segment the current account does not
//      have, which is what happens after RESEND_API_KEY moves to a new account.
//   1. Finishes any signup that Resend failed on at the time.
//   2. Reads the three RSS feeds and records any article it has not seen.
//   3. Sends each new article, one broadcast per batch of subscribers, for as
//      long as today's share of Resend's 100-a-day limit lasts. What does not
//      fit waits for the next run after midnight UTC.
//   4. Sends welcome emails the daily limit made wait.
//
// Hourly rather than once a day so a new article goes out within the hour of
// its deploy, and the first run after midnight UTC picks up where yesterday's
// stopped. Scheduled functions only run on the published production deploy,
// so a deploy preview never emails anybody.
//
// The feeds are read over HTTP from the live site rather than from the build
// output: they are the published truth, and an article only counts as new once
// a reader could actually open the link in the email.

/**
 * An article found in a feed for the first time is only announced if it was
 * published recently. An old one turning up is a renamed slug or a back-dated
 * import, and emailing it as "new" would be wrong.
 */
const FRESH_FOR_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Resend rejects a broadcast whose name is longer than this (422, "Field `name`
 * has a maximum of 70 items"), and nothing is sent. The name only labels the
 * broadcast in the dashboard, so the title is cut to make room for the batch.
 */
const MAX_BROADCAST_NAME = 70;

const broadcastName = (title: string, batchId: number) => {
  const suffix = ` - batch ${batchId}`;
  const room = MAX_BROADCAST_NAME - suffix.length;
  const chars = [...title.trim()];
  const head = chars.length > room ? `${chars.slice(0, room - 1).join("").trimEnd()}…` : chars.join("");
  return `${head}${suffix}`;
};

/** Bounds the pending-send query; nothing older than this is still unsent. */
const PENDING_WINDOW_MS = 120 * 24 * 60 * 60 * 1000;

const recordNewArticles = async () => {
  for (const locale of LOCALES) {
    let items: FeedItem[];
    try {
      items = await readFeed(locale);
    } catch (error) {
      console.error(`Newsletter: skipping the ${locale} feed this run`, error);
      continue;
    }
    if (items.length === 0) continue;

    const [seenBefore] = await db
      .select({ id: newsletterArticles.id })
      .from(newsletterArticles)
      .where(eq(newsletterArticles.locale, locale))
      .limit(1);
    const firstRun = !seenBefore;
    const freshSince = Date.now() - FRESH_FOR_MS;

    const inserted = await db
      .insert(newsletterArticles)
      .values(
        items.map((item) => ({
          url: item.url.slice(0, 512),
          locale,
          title: item.title.slice(0, 300),
          summary: item.summary || null,
          publishedAt: item.publishedAt,
          // The articles already live when the newsletter starts are its
          // starting point, not news.
          announce: !firstRun && (item.publishedAt === null || item.publishedAt.getTime() >= freshSince),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: newsletterArticles.id, announce: newsletterArticles.announce });

    if (inserted.length > 0) {
      const announced = inserted.filter((row) => row.announce).length;
      console.log(
        firstRun
          ? `Newsletter: recorded ${inserted.length} existing ${locale} articles as the starting point`
          : `Newsletter: found ${inserted.length} new ${locale} articles, ${announced} to announce`,
      );
    }
  }
};

/**
 * Every (article, batch) pair still owed a broadcast, in sending order: oldest
 * article first, and within one article the batches rotated by the article's
 * id, so the same subscribers are not always the ones who wait longest.
 *
 * A batch only owes an article if it existed when the article was found. A
 * batch opened later holds people who signed up afterwards, and their first
 * email should be the next article, not a backlog.
 */
const pendingDeliveries = async () => {
  const since = new Date(Date.now() - PENDING_WINDOW_MS);
  const articles = await db
    .select()
    .from(newsletterArticles)
    .where(and(eq(newsletterArticles.announce, true), gte(newsletterArticles.discoveredAt, since)))
    .orderBy(newsletterArticles.discoveredAt, newsletterArticles.id);
  if (articles.length === 0) return [];

  const batches = await db.select().from(newsletterBatches).orderBy(newsletterBatches.id);
  const done = new Set(
    (await db.select().from(newsletterDeliveries)).map((row) => `${row.articleId}:${row.batchId}`),
  );
  // A batch with members still missing from its segment waits, rather than
  // sending an article those members would then never get.
  const incomplete = await incompleteBatchIds();

  return articles.flatMap((article) => {
    const owed = batches.filter(
      (batch) =>
        batch.locale === article.locale &&
        batch.memberCount > 0 &&
        batch.createdAt <= article.discoveredAt &&
        !incomplete.has(batch.id) &&
        !done.has(`${article.id}:${batch.id}`),
    );
    const offset = owed.length ? article.id % owed.length : 0;
    return [...owed.slice(offset), ...owed.slice(0, offset)].map((batch) => ({ article, batch }));
  });
};

const sendPendingArticles = async () => {
  let { broadcasts: budget } = await remainingToday();
  const pending = await pendingDeliveries();
  if (pending.length === 0) return;
  // One lookup per article, shared by all of its batches.
  const picks = new Map<number, Awaited<ReturnType<typeof articlePicks>>>();

  for (const { article, batch } of pending) {
    // Strictly in order: a batch that does not fit today goes first tomorrow,
    // rather than being overtaken by smaller ones every day.
    if (batch.memberCount > budget) {
      console.log(`Newsletter: daily limit reached, ${pending.length} broadcasts still queued`);
      break;
    }

    // Claimed before Resend is asked, so two overlapping runs cannot both send.
    const [claim] = await db
      .insert(newsletterDeliveries)
      .values({ articleId: article.id, batchId: batch.id, recipients: batch.memberCount })
      .onConflictDoNothing()
      .returning();
    if (!claim) continue;

    if (!picks.has(article.id)) picks.set(article.id, await articlePicks(article.locale as Locale, article.url));
    const email = renderArticleEmail(article.locale as Locale, article, picks.get(article.id));
    try {
      const broadcast = await resend<{ id: string }>("POST", "/broadcasts", {
        segment_id: batch.resendSegmentId,
        from: SENDER,
        reply_to: REPLY_TO,
        subject: email.subject,
        html: email.html,
        text: email.text,
        name: broadcastName(article.title, batch.id),
        send: true,
      });
      await db
        .update(newsletterDeliveries)
        .set({ resendBroadcastId: broadcast.id })
        .where(eq(newsletterDeliveries.id, claim.id));
      budget -= batch.memberCount;
      console.log(`Newsletter: sent article ${article.id} to batch ${batch.id} (${batch.memberCount} max)`);
    } catch (error) {
      // Released so the next run tries again. Stops here: whatever went wrong
      // is likely to go wrong for the next batch too.
      await db.delete(newsletterDeliveries).where(eq(newsletterDeliveries.id, claim.id));
      console.error(`Newsletter: broadcast of article ${article.id} to batch ${batch.id} failed`, error);
      break;
    }
  }
};

export default async () => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Newsletter: RESEND_API_KEY is not set; nothing sent");
    return;
  }

  try {
    await rebuildMissingSegments();
  } catch (error) {
    console.error("Newsletter: could not check the Resend segments; nothing sent this run", error);
    return;
  }

  for (const subscriber of await unsyncedSubscribers(10)) {
    try {
      await syncSubscriber(subscriber);
    } catch (error) {
      console.error(`Newsletter: subscriber ${subscriber.id} still not synced`, error);
    }
  }

  await recordNewArticles();
  await sendPendingArticles();

  for (const subscriber of await pendingWelcomes(10)) {
    try {
      if (!(await sendWelcome(subscriber))) break;
    } catch (error) {
      console.error(`Newsletter: welcome for subscriber ${subscriber.id} failed`, error);
      break;
    }
  }
};

export const config: Config = {
  schedule: "17 * * * *",
};
