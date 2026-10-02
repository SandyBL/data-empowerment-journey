import { randomBytes } from "node:crypto";
import { and, desc, eq, gte, isNotNull, lt, sql, sum, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { newsletterBatches, newsletterDeliveries, newsletterSubscribers } from "../../db/schema.js";
import { renderWelcomeEmail } from "./newsletter-emails.js";
import { popularArticles, siteOrigin } from "./newsletter-feed.js";

/**
 * Everything the newsletter functions agree on.
 *
 * Three entry points share this module: submission-created.mts (a reader signs
 * up through the Netlify Form called "newsletter"), newsletter-send.mts (the
 * hourly job that finds new articles and sends them) and
 * newsletter-unsubscribe.mts (the link at the bottom of the welcome email).
 *
 * The constraint that shapes all of it is Resend's free plan: 100 emails per
 * UTC day, counting every email the account sends -- welcomes, broadcasts and
 * any test sent by hand from the dashboard. The site's owner chose to stay on
 * that plan, so a new article reaches the list in daily instalments of at most
 * BATCH_SIZE recipients, and the welcome emails share whatever is left.
 */

export const LOCALES = ["en", "es", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** Recipients per Resend segment, and so the most one broadcast can cost. */
export const BATCH_SIZE = 90;

/** Resend's free-plan ceiling, per UTC calendar day. */
export const DAILY_QUOTA = 100;

/**
 * Left untouched every day, so the owner can send a test from the Resend
 * dashboard without that test being the email that pushes a broadcast over the
 * limit.
 */
const MANUAL_RESERVE = 2;

export const SENDER = "Data Governance Journey <newsletter@updates.datagovjourney.com>";
export const REPLY_TO = "datagovjourney@gmail.com";

export { siteOrigin };

export const unsubscribeUrl = (token: string) =>
  `${siteOrigin()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;

// --- Resend -----------------------------------------------------------------

export class ResendError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Resend replied ${status}: ${body.slice(0, 300)}`);
  }
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One call to the Resend API. Retries once on a rate-limit reply (the account
 * allows 10 requests a second, which an hourly run is nowhere near, but a
 * signup arriving at the same moment shares it) and never on a quota reply,
 * which only midnight UTC can cure.
 */
export const resend = async <T = Record<string, unknown>>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");

  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(`https://api.resend.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (response.ok) return (text ? JSON.parse(text) : {}) as T;

    const quota = /quota_exceeded/.test(text);
    if (response.status === 429 && !quota && attempt === 0) {
      await pause(1100);
      continue;
    }
    throw new ResendError(response.status, text);
  }
};

// --- The day's budget ---------------------------------------------------------

const startOfUtcDay = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/**
 * What has been spent today, by kind. Broadcasts are counted at the size of the
 * batch they went to, an upper bound: Resend skips the contacts who have
 * unsubscribed, so the true figure can only be lower.
 */
export const spentToday = async () => {
  const since = startOfUtcDay();
  const [broadcasts] = await db
    .select({ total: sum(newsletterDeliveries.recipients) })
    .from(newsletterDeliveries)
    .where(gte(newsletterDeliveries.sentAt, since));
  const [welcomes] = await db
    .select({ total: count() })
    .from(newsletterSubscribers)
    .where(gte(newsletterSubscribers.welcomeSentAt, since));
  return { broadcasts: Number(broadcasts?.total ?? 0), welcomes: Number(welcomes?.total ?? 0) };
};

/** How many more emails of each kind may go out before midnight UTC. */
export const remainingToday = async () => {
  const spent = await spentToday();
  const overall = DAILY_QUOTA - MANUAL_RESERVE - spent.broadcasts - spent.welcomes;
  return {
    broadcasts: Math.max(0, Math.min(BATCH_SIZE - spent.broadcasts, overall)),
    welcomes: Math.max(0, overall),
  };
};

// --- Subscribers --------------------------------------------------------------

export const newUnsubscribeToken = () => randomBytes(32).toString("hex");

/**
 * The name the emails greet a subscriber by, from whatever they typed.
 *
 * Resend inserts {{{contact.first_name}}} into a broadcast's HTML without
 * escaping it, so this is the only thing standing between the signup form and
 * markup in an email sent to a whole batch. Hence an allow-list rather than an
 * escape: letters in any script, combining marks, and the hyphen, apostrophe
 * and dot that real names contain. Only the first word is kept -- the emails
 * say "Hi Maria", not "Hi Maria da Silva Santos" -- and an empty result is null,
 * which the emails turn into a greeting without a name.
 */
export const cleanFirstName = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const word = value
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\s'’.-]/gu, "")
    .trim()
    .split(/\s+/)[0];
  const name = (word ?? "").replace(/^[-'’.]+|[-'’.]+$/g, "").slice(0, 50);
  if (!name) return null;
  // "maria" and "MARIA" become "Maria"; a name typed in mixed case is kept.
  const flat = name === name.toLowerCase() || name === name.toUpperCase();
  return flat ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : name;
};

/**
 * The batch a new subscriber of this language goes into: the newest one with a
 * free place, or a new segment when they are all full.
 *
 * The place is claimed with a single conditional UPDATE, so two signups at the
 * same instant cannot both take the 90th seat. Two signups that both find every
 * batch full do each create a segment, which is harmless: both are below the
 * limit, and the next subscriber fills the newer one.
 */
const claimBatchPlace = async (locale: Locale) => {
  const [open] = await db
    .select({ id: newsletterBatches.id })
    .from(newsletterBatches)
    .where(and(eq(newsletterBatches.locale, locale), lt(newsletterBatches.memberCount, BATCH_SIZE)))
    .orderBy(desc(newsletterBatches.id))
    .limit(1);

  if (open) {
    const [claimed] = await db
      .update(newsletterBatches)
      .set({ memberCount: sql`${newsletterBatches.memberCount} + 1` })
      .where(and(eq(newsletterBatches.id, open.id), lt(newsletterBatches.memberCount, BATCH_SIZE)))
      .returning();
    if (claimed) return claimed;
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(newsletterBatches)
    .where(eq(newsletterBatches.locale, locale));
  const segment = await resend<{ id: string }>("POST", "/segments", {
    name: `Newsletter ${locale.toUpperCase()} - batch ${Number(total) + 1}`,
  });
  const [created] = await db
    .insert(newsletterBatches)
    .values({ locale, resendSegmentId: segment.id, memberCount: 1 })
    .returning();
  return created;
};

type Subscriber = typeof newsletterSubscribers.$inferSelect;

/**
 * Makes sure a subscriber exists in Resend, inside their batch's segment.
 * Safe to call again for a row that is already synced; the hourly job does
 * exactly that for any row a failed signup left behind.
 */
export const syncSubscriber = async (subscriber: Subscriber) => {
  let batchId = subscriber.batchId;
  let segmentId: string;

  if (batchId === null) {
    const batch = await claimBatchPlace(subscriber.locale as Locale);
    batchId = batch.id;
    segmentId = batch.resendSegmentId;
    await db.update(newsletterSubscribers).set({ batchId }).where(eq(newsletterSubscribers.id, subscriber.id));
  } else {
    const [batch] = await db.select().from(newsletterBatches).where(eq(newsletterBatches.id, batchId));
    segmentId = batch.resendSegmentId;
  }

  if (subscriber.resendContactId) return { ...subscriber, batchId };

  let contactId: string;
  try {
    const contact = await resend<{ id: string }>("POST", "/contacts", {
      email: subscriber.email,
      ...(subscriber.firstName ? { first_name: subscriber.firstName } : {}),
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });
    contactId = contact.id;
  } catch (error) {
    // The address is already a contact -- someone added it by hand in the
    // dashboard, or an earlier attempt got as far as Resend and no further.
    // Resubscribing it is right: the person has just asked for the list again.
    // Resend does not document which status it uses for this, so any client
    // error other than auth and rate limiting gets one attempt at the update;
    // if the contact really does not exist, the original error is the one
    // worth logging.
    if (!(error instanceof ResendError) || error.status < 400 || error.status >= 500) throw error;
    if ([401, 403, 429].includes(error.status)) throw error;
    const email = encodeURIComponent(subscriber.email);
    try {
      const contact = await resend<{ id: string }>("PATCH", `/contacts/${email}`, {
        ...(subscriber.firstName ? { first_name: subscriber.firstName } : {}),
        unsubscribed: false,
      });
      await resend("POST", `/contacts/${email}/segments/${segmentId}`);
      contactId = contact.id;
    } catch {
      throw error;
    }
  }

  await db
    .update(newsletterSubscribers)
    .set({ resendContactId: contactId })
    .where(eq(newsletterSubscribers.id, subscriber.id));
  return { ...subscriber, batchId, resendContactId: contactId };
};

/**
 * Sends the welcome email if today's budget still has room for it. Returns
 * false when it does not; the row keeps a null `welcomeSentAt` and the hourly
 * job sends it once the quota resets.
 */
export const sendWelcome = async (subscriber: Subscriber) => {
  if (subscriber.welcomeSentAt || subscriber.unsubscribedAt) return true;
  const remaining = await remainingToday();
  if (remaining.welcomes < 1) return false;

  const locale = subscriber.locale as Locale;
  const email = renderWelcomeEmail(
    locale,
    subscriber.firstName,
    unsubscribeUrl(subscriber.unsubscribeToken),
    await popularArticles(locale, 3),
  );
  await resend("POST", "/emails", {
    from: SENDER,
    to: [subscriber.email],
    reply_to: REPLY_TO,
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl(subscriber.unsubscribeToken)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  await db
    .update(newsletterSubscribers)
    .set({ welcomeSentAt: new Date() })
    .where(eq(newsletterSubscribers.id, subscriber.id));
  return true;
};

/**
 * Rows a failed signup left half-done, oldest first. Five minutes old at least,
 * so the retry never races the signup that is still working on the row.
 */
export const unsyncedSubscribers = (limit: number) =>
  db
    .select()
    .from(newsletterSubscribers)
    .where(
      and(
        sql`${newsletterSubscribers.resendContactId} is null and ${newsletterSubscribers.unsubscribedAt} is null`,
        lt(newsletterSubscribers.createdAt, new Date(Date.now() - 5 * 60 * 1000)),
      ),
    )
    .orderBy(newsletterSubscribers.id)
    .limit(limit);

/**
 * Welcomes deferred by the daily limit. Only for signups from the last three
 * days: a welcome arriving a week late reads as spam, and by then the person
 * has had a broadcast anyway.
 */
export const pendingWelcomes = (limit: number) =>
  db
    .select()
    .from(newsletterSubscribers)
    .where(
      and(
        isNotNull(newsletterSubscribers.resendContactId),
        sql`${newsletterSubscribers.welcomeSentAt} is null`,
        sql`${newsletterSubscribers.unsubscribedAt} is null`,
        gte(newsletterSubscribers.createdAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
      ),
    )
    .orderBy(newsletterSubscribers.id)
    .limit(limit);
