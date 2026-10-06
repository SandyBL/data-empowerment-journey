/**
 * What the "new article" email recommends alongside the article it announces:
 * one more article to read and one glossary term, per article per language, at
 * /assets/newsletter/<lang>.json.
 *
 * The newsletter function (netlify/functions/newsletter-send.mts) runs on a
 * schedule and only reads the live site over HTTP, the same way it reads the
 * feeds. It has no Markdown, no categories and no glossary of its own, so the
 * choice is made here, where all three are already loaded, and published as a
 * small file keyed by article slug.
 */

import { SITE_ORIGIN } from './brand.mjs';
import { articlePath, glossaryTermAnchor } from './routes.mjs';

/**
 * Other articles in the same language, same category first and newest after
 * that. The article page's "keep reading" section shows the first three; the
 * email recommends the first, so the two never disagree.
 */
export const relatedArticles = (article, articles) =>
  articles
    .filter((candidate) => candidate.lang === article.lang && candidate.slug !== article.slug)
    .sort((first, second) => {
      const sameCategory =
        Number(second.categoryKey === article.categoryKey) - Number(first.categoryKey === article.categoryKey);
      return sameCategory || second.date.localeCompare(first.date);
    });

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * How often the article's text uses a term, by its name or any alias. Letter
 * lookarounds rather than \b, which treats "ó" and "ç" as word boundaries.
 */
const mentions = (term, text) =>
  [term.term, ...term.also]
    .filter((name) => name && name.length > 2)
    .reduce((total, name) => total + (text.match(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`, 'giu'))?.length ?? 0), 0);

/**
 * The term a reader of this article is most likely to want defined: one whose
 * definition already points at this article, then the one the article
 * mentions most. An article that uses none of the terms gets none, rather than
 * a definition that has nothing to do with it.
 */
const pickTerm = (article, terms) => {
  const text = `${article.title}\n${article.summary}\n${article.body}`;
  const ranked = terms
    .filter((term) => term.lang === article.lang)
    .map((term) => ({ term, linked: term.articleKey === article.translationKey, count: mentions(term, text) }))
    .filter((entry) => entry.linked || entry.count > 0)
    .sort((first, second) => Number(second.linked) - Number(first.linked) || second.count - first.count);
  return ranked[0]?.term ?? null;
};

export const renderNewsletterPicks = (lang, articles, terms) => {
  const picks = {};
  for (const article of articles.filter((entry) => entry.lang === lang)) {
    const related = relatedArticles(article, articles)[0];
    const term = pickTerm(article, terms);
    picks[article.slug] = {
      related: related
        ? {
            url: `${SITE_ORIGIN}${articlePath(lang, related.slug)}`,
            title: related.title,
            summary: related.summary || null,
          }
        : null,
      term: term
        ? { url: `${SITE_ORIGIN}${glossaryTermAnchor(lang, term.slug)}`, term: term.term, short: term.short }
        : null,
    };
  }
  return `${JSON.stringify(picks)}\n`;
};
