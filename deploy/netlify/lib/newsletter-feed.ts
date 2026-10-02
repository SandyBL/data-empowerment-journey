import { and, count, eq, gte, like } from "drizzle-orm";
import { db } from "../../db/index.js";
import { webVitals } from "../../db/schema.js";
import type { Locale } from "./newsletter.js";

/**
 * The site's own RSS feeds, read over HTTP, and the ranking that picks which
 * past articles a new subscriber's welcome email recommends.
 *
 * Shared by newsletter-send.mts, which reads the feeds to find new articles,
 * and the welcome email in newsletter.ts, which reads them as the catalogue of
 * published articles to recommend from.
 */

/**
 * Netlify sets URL to the production address of the site. The fallback is the
 * same address, so a missing variable cannot point a link at a deploy preview.
 */
export const siteOrigin = () => (process.env.URL || "https://datagovjourney.com").replace(/\/$/, "");

const decodeXml = (text: string) =>
  text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .trim();

const tag = (item: string, name: string) => {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return match ? decodeXml(match[1]) : "";
};

export type FeedItem = { url: string; title: string; summary: string; publishedAt: Date | null };

/**
 * The items of one language's feed (scripts/lib/feeds.mjs writes it). Throws
 * rather than returning an empty list when the feed cannot be read, because
 * "no articles" and "could not look" must never be confused: the first run
 * records everything it sees as already published, and a run that saw nothing
 * would make the whole back catalogue look new the hour after.
 */
export const readFeed = async (locale: Locale): Promise<FeedItem[]> => {
  const response = await fetch(`${siteOrigin()}/${locale}/feed.xml`, { headers: { Accept: "application/rss+xml" } });
  if (!response.ok) throw new Error(`/${locale}/feed.xml replied ${response.status}`);
  const xml = await response.text();
  if (!xml.includes("<rss")) throw new Error(`/${locale}/feed.xml is not an RSS document`);

  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => {
      const date = new Date(tag(item, "pubDate"));
      return {
        url: tag(item, "link"),
        title: tag(item, "title"),
        summary: tag(item, "description"),
        publishedAt: Number.isNaN(date.getTime()) ? null : date,
      };
    })
    .filter((item) => item.url.startsWith("https://") && item.title);
};

/** How far back the visit count looks. Recent enough to follow what is read now. */
const POPULAR_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * The most-read articles in one language, most visits first.
 *
 * The site has no page-view analytics, by design. The nearest thing it has is
 * the anonymous Core Web Vitals beacon (assets/js/web-vitals.js), and every
 * page load that reports anything reports a TTFB, once, so counting TTFB rows
 * per article path counts visits closely enough to rank on. It is a sample --
 * a visitor who leaves before the beacon fires is not in it -- and while
 * traffic is low the ranking is noisy. Ties, including the all-zero tie of an
 * article nobody has visited yet, keep the feed's order, which is newest
 * first, so with no visit data at all the email simply recommends the latest
 * articles.
 *
 * Never throws: the welcome email goes out without recommendations rather than
 * not at all.
 */
export const popularArticles = async (locale: Locale, limit: number): Promise<FeedItem[]> => {
  try {
    const items = await readFeed(locale);
    const visits = await db
      .select({ path: webVitals.path, views: count() })
      .from(webVitals)
      .where(
        and(
          eq(webVitals.metric, "TTFB"),
          like(webVitals.path, `/${locale}/blog/%`),
          gte(webVitals.createdAt, new Date(Date.now() - POPULAR_WINDOW_MS)),
        ),
      )
      .groupBy(webVitals.path);
    const views = new Map(visits.map((row) => [row.path, Number(row.views)]));
    const viewsOf = (item: FeedItem) => views.get(new URL(item.url).pathname) ?? 0;

    // Array.prototype.sort is stable, which is what keeps ties newest first.
    return [...items].sort((first, second) => viewsOf(second) - viewsOf(first)).slice(0, limit);
  } catch (error) {
    console.error(`Newsletter: could not rank ${locale} articles for the welcome email`, error);
    return [];
  }
};
