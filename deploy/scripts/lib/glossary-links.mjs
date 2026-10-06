/**
 * Ties articles to the glossary without anyone having to do it by hand.
 *
 * Every link between an article and a definition used to be typed into the
 * Markdown, so a new article reached the glossary only if its author remembered
 * to link it, and a term reached its articles only through the single `article:`
 * key in its front matter. Seven of the twenty English articles linked to no
 * term at all. This module reads the published text instead:
 *
 * - detectArticleTerms() finds every term an article mentions, by its name,
 *   any of its `also` names or any of its `match` spellings, plus every term
 *   the author already linked.
 * - linkFirstMentions() turns the first unlinked mention of each term into a
 *   link to its definition, leaving headings, existing links, code and figures
 *   alone. A term the author already linked is never linked a second time.
 * - termArticleIndex() is the reverse: for each term, the articles that use it,
 *   which the glossary hub lists under the definition.
 *
 * Matching is per language, against that language's own term files, so the
 * Spanish article is matched against "propietario de datos" and not against
 * "data owner". Longer names win over the shorter names they contain, so
 * "data quality dimensions" is one mention rather than a mention of "data
 * quality" with two stray words after it.
 *
 * Runs on every build, so a newly published article is linked the moment it
 * deploys, and a newly added term is picked up by every article that already
 * uses it.
 */

import { escapeHtml } from './markdown.mjs';

/** Elements whose text is never turned into a link. */
const SKIPPED_ELEMENTS = new Set([
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'code',
  'pre',
  'figure',
  'figcaption',
  'svg',
  'script',
  'style',
  'button',
  'summary',
  'dfn',
  'aside',
]);

/** Elements whose text does not count as a mention at all. */
const UNREAD_ELEMENTS = new Set(['code', 'pre', 'svg', 'script', 'style']);

const VOID_ELEMENTS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'wbr', 'col', 'area']);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A name as a pattern: case-insensitive, whitespace-tolerant, bounded by
 * anything that is not a letter or digit, and with an optional plural ending
 * so "data stewards" and "contratos de datos" still count. Names in parentheses
 * ("Personally identifiable information (PII)") are matched without them.
 */
const namePattern = (name) =>
  escapeRegExp(name.replace(/\s*\([^)]*\)\s*/g, ' ').trim()).replace(/\s+/g, '\\s+');

/**
 * Names shorter than this, or one-word names that are also everyday words, are
 * not matched: "owner" or "AI" on their own would link half of every article.
 * Acronyms are the exception -- "MDM", "RBAC", "PII" -- because a capitalized
 * acronym means one thing.
 */
const usableName = (name) => {
  const clean = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  if (/^[A-Z]{3,}$/.test(clean)) return true;
  if (clean.length < 6) return false;
  return /\s/.test(clean) || clean.length >= 8;
};

const isAcronym = (name) => /^[A-Z]{3,}$/.test(name.trim());

/**
 * Builds one matcher per language. Each name maps back to its term slug; the
 * alternation is ordered longest first so the regex engine prefers the longer
 * name at any given position.
 */
export function buildTermMatchers(terms) {
  const matchers = new Map();
  const byLang = new Map();
  for (const term of terms) {
    if (!byLang.has(term.lang)) byLang.set(term.lang, []);
    byLang.get(term.lang).push(term);
  }

  for (const [lang, localized] of byLang) {
    const names = [];
    for (const term of localized) {
      for (const name of [term.term, ...term.also, ...(term.match ?? [])]) {
        if (!name || !usableName(name)) continue;
        names.push({ name, slug: term.slug, acronym: isAcronym(name) });
      }
    }
    names.sort((first, second) => second.name.length - first.name.length);

    // Acronyms are matched case-sensitively and everything else is not, so the
    // two kinds are compiled separately and the earliest match of either wins.
    const compile = (list, flags) => {
      if (!list.length) return null;
      const lookup = new Map();
      const alternation = list
        .map((entry, index) => {
          lookup.set(`n${index}`, entry.slug);
          const plural = entry.acronym ? 's?' : '(?:s|es)?';
          return `(?<n${index}>${namePattern(entry.name)}${plural})`;
        })
        .join('|');
      return {
        regex: new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternation})(?![\\p{L}\\p{N}])`, flags),
        lookup,
      };
    };

    matchers.set(lang, {
      words: compile(names.filter((entry) => !entry.acronym), 'giu'),
      acronyms: compile(names.filter((entry) => entry.acronym), 'gu'),
      bySlug: new Map(localized.map((term) => [term.slug, term])),
    });
  }
  return matchers;
}

/**
 * Bracketed citations -- "[Gartner, Data Governance Framework]" -- name a
 * source, not the concept, so they are blanked out before matching. Same
 * length, so every index still lines up with the original text.
 */
const maskCitations = (text) => text.replace(/\[[^\]]*\]/g, (citation) => ' '.repeat(citation.length));

/** Every match in a run of text, earliest first, non-overlapping. */
function findMentions(original, matcher) {
  const text = maskCitations(original);
  const found = [];
  for (const compiled of [matcher.words, matcher.acronyms]) {
    if (!compiled) continue;
    compiled.regex.lastIndex = 0;
    for (const match of text.matchAll(compiled.regex)) {
      const key = Object.keys(match.groups).find((group) => match.groups[group] !== undefined);
      const end = match.index + match[0].length;
      found.push({ index: match.index, end, text: original.slice(match.index, end), slug: compiled.lookup.get(key) });
    }
  }
  found.sort((first, second) => first.index - second.index || second.end - first.end);
  const kept = [];
  let cursor = -1;
  for (const mention of found) {
    if (mention.index < cursor) continue;
    kept.push(mention);
    cursor = mention.end;
  }
  return kept;
}

/**
 * Walks the HTML as a flat list of tags and text runs, reporting for each text
 * run which skipped and unread elements it sits inside. Rendered Markdown is
 * well-formed, so a counter per element name is all the nesting this needs.
 */
function walkHtml(html, onText) {
  const open = new Map();
  const inside = (set) => [...open].some(([name, depth]) => depth > 0 && set.has(name));
  const parts = html.split(/(<[^>]+>)/);
  return parts
    .map((part) => {
      if (!part) return part;
      if (part.startsWith('<')) {
        const tag = /^<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9-]*)/.exec(part);
        if (tag) {
          const name = tag[2].toLowerCase();
          if (!VOID_ELEMENTS.has(name) && !part.endsWith('/>')) {
            const depth = open.get(name) ?? 0;
            open.set(name, Math.max(0, depth + (tag[1] ? -1 : 1)));
          }
        }
        return part;
      }
      return onText(part, { skipped: inside(SKIPPED_ELEMENTS), unread: inside(UNREAD_ELEMENTS) });
    })
    .join('');
}

/** The term slug an internal glossary href points at, or null. */
const linkedTermSlug = (href, lang) => {
  const match = new RegExp(`^/${lang}/glossary/([a-z0-9-]+)/`).exec(href);
  return match ? match[1] : null;
};

/** Slugs of the terms the author already linked by hand, in order. */
function manualLinks(html, lang) {
  const slugs = [];
  for (const match of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const slug = linkedTermSlug(match[1], lang);
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }
  return slugs;
}

/**
 * Every term an article mentions, in the order a reader meets them: linked by
 * hand or simply named in the text, including headings. Only terms that exist
 * in the article's language are returned.
 */
export function detectArticleTerms(article, matchers) {
  const matcher = matchers.get(article.lang);
  if (!matcher) return [];
  const positions = new Map();
  let offset = 0;
  const note = (slug, position) => {
    if (matcher.bySlug.has(slug) && !positions.has(slug)) positions.set(slug, position);
  };

  // Hand-written links count where they appear in the source.
  for (const match of article.bodyHtml.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const slug = linkedTermSlug(match[1], article.lang);
    if (slug) note(slug, match.index);
  }
  walkHtml(article.bodyHtml, (text, { unread }) => {
    if (!unread) for (const mention of findMentions(text, matcher)) note(mention.slug, offset + mention.index);
    offset += text.length;
    return text;
  });
  // The title counts as the earliest mention of all.
  for (const mention of findMentions(article.title, matcher)) note(mention.slug, -1);

  return [...positions].sort((first, second) => first[1] - second[1]).map(([slug]) => matcher.bySlug.get(slug));
}

/**
 * Links the first unlinked mention of every term in an article's body. Terms
 * the author linked by hand anywhere in the article are left as they are, so
 * the automatic links only fill gaps and never double up on a deliberate one.
 */
export function linkFirstMentions(html, lang, matchers) {
  const matcher = matchers.get(lang);
  if (!matcher) return html;
  const linked = new Set(manualLinks(html, lang));

  return walkHtml(html, (text, { skipped }) => {
    if (skipped) return text;
    let output = '';
    let cursor = 0;
    for (const mention of findMentions(text, matcher)) {
      if (linked.has(mention.slug)) continue;
      linked.add(mention.slug);
      const term = matcher.bySlug.get(mention.slug);
      output += `${text.slice(cursor, mention.index)}<a class="glossary-mention" href="/${lang}/glossary/${mention.slug}/" title="${escapeHtml(term.short)}">${mention.text}</a>`;
      cursor = mention.end;
    }
    return output + text.slice(cursor);
  });
}

/** `${lang}:${slug}` -> the articles in that language that mention the term, newest first. */
export function termArticleIndex(articles) {
  const index = new Map();
  for (const article of [...articles].sort((first, second) => second.date.localeCompare(first.date))) {
    for (const term of article.glossaryTerms ?? []) {
      const key = `${article.lang}:${term.slug}`;
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(article);
    }
  }
  return index;
}
