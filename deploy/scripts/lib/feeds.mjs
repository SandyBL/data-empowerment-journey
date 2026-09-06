/**
 * One RSS 2.0 feed per language, at /<lang>/feed.xml.
 *
 * RSS is a machine-readable version of the blog index: the same list of
 * articles, as XML, with the title, link, date, category and summary of each.
 * Nothing renders it — it exists so that other software can watch this site
 * without anybody's permission and without an email address changing hands.
 * Three kinds of software do:
 *
 *   Readers      Feedly, Inoreader, NetNewsWire, Thunderbird. A practitioner who
 *                subscribes sees every new article the day it goes out, in a
 *                place they already check, with no algorithm deciding whether to
 *                show it to them.
 *   Aggregators  newsletters, community digests, and the "data governance links
 *                of the week" roundups that are how a small site gets its first
 *                inbound links. Most of them accept a feed URL and nothing else.
 *   Automation   Zapier, Make, n8n, Slack's /feed, Discord webhooks. This is what
 *                lets someone else cross-post this site's articles for free.
 *
 * A feed per language rather than one combined feed, because a subscriber wants
 * the articles they can read: a Brazilian reader following a single feed would
 * get every article three times, twice in a language they did not ask for.
 *
 * The `atom:link rel="self"` element is what makes the feed self-describing —
 * validators require it, and a reader that has followed a redirect uses it to
 * learn the feed's real address.
 */

import { SITE_ORIGIN } from './brand.mjs';

const FEED_COPY = {
  en: {
    title: 'Data Governance Journey — Insights',
    description:
      'Practical writing on data governance, data quality, data literacy, and responsible AI, for the people who have to make it work day to day.',
    language: 'en-us',
  },
  es: {
    title: 'Data Governance Journey — Ideas',
    description:
      'Artículos prácticos sobre gobierno de datos, calidad de datos, alfabetización de datos e IA responsable, para quienes tienen que aplicarlo cada día.',
    language: 'es-es',
  },
  pt: {
    title: 'Data Governance Journey — Ideias',
    description:
      'Artigos práticos sobre governança de dados, qualidade de dados, alfabetização de dados e IA responsável, para quem precisa aplicar isso no dia a dia.',
    language: 'pt-br',
  },
};

/** How many articles a feed carries. Enough to be a useful archive on a first fetch. */
const FEED_LENGTH = 30;

/**
 * XML has no HTML entities beyond these five, and an article title containing an
 * ampersand or a quotation mark is the ordinary case, not the edge case.
 */
const escapeXml = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * RFC 822, which RSS 2.0 requires — an ISO date is silently ignored by some
 * readers and rejected by validators. The dates in front matter carry no time,
 * so noon UTC is used: it lands on the intended calendar day in every timezone
 * a reader might be in, which midnight does not.
 */
const rfc822 = (isoDate) => new Date(`${isoDate}T12:00:00Z`).toUTCString();

export const renderFeed = (lang, articles) => {
  const copy = FEED_COPY[lang];
  const localized = [...articles]
    .filter((article) => article.lang === lang)
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, FEED_LENGTH);

  const feedUrl = `${SITE_ORIGIN}/${lang}/feed.xml`;
  const blogUrl = `${SITE_ORIGIN}/${lang}/blog/`;
  // The newest revision on the feed, not the build time: a feed whose
  // lastBuildDate moves on every deploy tells a reader it changed when it did not.
  const newest = localized.reduce((latest, article) => (article.updated > latest ? article.updated : latest), '');

  const items = localized
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_ORIGIN}/${lang}/blog/${article.slug}/</link>
      <guid isPermaLink="true">${SITE_ORIGIN}/${lang}/blog/${article.slug}/</guid>
      <pubDate>${rfc822(article.date)}</pubDate>
      <dc:creator>${escapeXml(article.author)}</dc:creator>
      <category>${escapeXml(article.category)}</category>
      <description>${escapeXml(article.summary || article.title)}</description>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(copy.title)}</title>
    <link>${blogUrl}</link>
    <atom:link rel="self" type="application/rss+xml" href="${feedUrl}"/>
    <description>${escapeXml(copy.description)}</description>
    <language>${copy.language}</language>
    <copyright>© ${new Date().getUTCFullYear()} Data Governance Journey</copyright>
    <generator>scripts/lib/feeds.mjs</generator>
    <!-- No managingEditor/webMaster: RSS wants an email address in both, and this
         site deliberately publishes none — contact goes through the form. An
         invented address would be a real one that bounces. -->
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>720</ttl>${newest ? `\n    <lastBuildDate>${rfc822(newest)}</lastBuildDate>` : ''}
    <image>
      <url>${SITE_ORIGIN}/assets/images/og-default.png</url>
      <title>${escapeXml(copy.title)}</title>
      <link>${blogUrl}</link>
    </image>
${items}
  </channel>
</rss>
`;
};
