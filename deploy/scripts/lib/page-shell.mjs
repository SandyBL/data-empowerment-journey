/**
 * The shell every non-blog page is rendered into: head, header, footer.
 *
 * Until now this site had two kinds of page — the trilingual homepage master in
 * src/home.html, and the blog, generated from Markdown. Everything else the site
 * sells or gives away lived inside the homepage as a fragment: the calculator was
 * "/#cost-calculator", the templates were "/#plantillas", the workshop offer had
 * no address at all. A fragment is not a page. It cannot be the canonical result
 * for a query, it cannot be linked to from anywhere with its own title, and
 * Search Console files every one of them under the homepage, so the homepage
 * competes with itself for a dozen different intents.
 *
 * This module gives those things pages. It reuses the blog's stylesheet for
 * typography and the site-wide header from ./site-nav.mjs for navigation,
 * rather than inventing a third visual language.
 *
 * One wrinkle about stylesheets. The resource pages embed markup lifted out of
 * the homepage, which is written against the hand-authored Tailwind subset in
 * assets/styles.css, so those pages have to load it. But that file carries
 * global resets the blog has never had to live with -- `h1, h2, h3, p
 * { margin: 0 }` and `a { color: inherit; text-decoration: inherit }` among them
 * -- because no blog page links it. Loading it everywhere would strip the
 * spacing and link colour out of every page here to serve four of them.
 *
 * So it is opt-in: pass `embedsHomeMarkup` and the page gets styles.css first,
 * blog.css second (so the blog's typography wins the overlap), and the
 * `page--embedded` body class, which is where assets/css/pages.css puts the
 * margins back for prose that the reset would otherwise flatten.
 */

import { OG_IMAGE, SITE_ORIGIN } from './brand.mjs';
import { LANGUAGES, NAV, feedPath, renderSiteFooter, renderSiteHeader } from './site-nav.mjs';

export const HTML_LANG = { en: 'en', es: 'es', pt: 'pt-BR' };
export const OG_LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR' };
export const DATE_LOCALE = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };

/**
 * The routes, the labels and the header and footer themselves now live in
 * ./site-nav.mjs, because the blog templates and the confession wall render the
 * same header as these pages and importing it from the page shell would have
 * meant the confession wall depending on the shell it does not use.
 *
 * They are re-exported here because a dozen modules already import them from
 * this file, and a rename with no behaviour change is a worse diff than a line
 * of re-exports.
 */
export {
  HOME_PATH,
  LANGUAGES,
  NAV,
  NAV_GROUPS,
  NEWSLETTER_URL,
  feedPath,
  pagePath,
  pageLanguageHrefs,
  renderLanguageSwitcher,
  renderSiteFooter,
  renderSiteHeader,
  simulatorPath,
} from './site-nav.mjs';

/**
 * Font Awesome, pinned to the exact URL and hash recorded in
 * scripts/check-asset-integrity.mjs. The embedded homepage blocks are full of
 * `fa-solid` glyphs, so a page that renders one without this stylesheet shows
 * empty boxes where the icons should be.
 *
 * Exported because the article and category templates in
 * scripts/generate-blog-index.mjs need the same tag for the share row's icons,
 * and two copies of a pinned URL is how one of them goes stale.
 */
export const FONT_AWESOME = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous" referrerpolicy="no-referrer">`;

const escapeAttribute = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The visible breadcrumb trail that the BreadcrumbList schema describes. */
export const renderBreadcrumb = (steps, label) => {
  const items = steps
    .map((step, position) => {
      const isLast = position === steps.length - 1;
      const name = escapeAttribute(step.name);
      return `<li>${isLast ? `<span aria-current="page">${name}</span>` : `<a href="${step.item}">${name}</a>`}</li>`;
    })
    .join('');
  return `<nav class="article-breadcrumb" aria-label="${escapeAttribute(label)}"><ol>${items}</ol></nav>`;
};

/** BreadcrumbList from the same array the markup above renders. */
export const breadcrumbSchema = (canonical, steps) => ({
  '@type': 'BreadcrumbList',
  '@id': `${canonical}#breadcrumb`,
  itemListElement: steps.map((step, position) => ({
    '@type': 'ListItem',
    position: position + 1,
    name: step.name,
    item: step.item,
  })),
});

/**
 * Renders a complete page.
 *
 * `alternates` is the hreflang cluster as [{ hreflang, url }]; it is passed in
 * because a glossary term that exists in two languages must not advertise a
 * third, and only the caller knows. `languageHrefs` is the same idea for the
 * header's language switcher: a map of language to URL, documented on
 * renderLanguageSwitcher.
 */
export const renderPage = ({
  lang,
  canonical,
  title,
  description,
  alternates,
  schema,
  main,
  languageHrefs,
  current = '',
  bodyClass = '',
  embedsHomeMarkup = false,
  skipTarget = 'main',
  ogType = 'website',
  extraHead = '',
  extraScripts = '',
}) => {
  const nav = NAV[lang];
  // See the note at the top of this file: the homepage's stylesheet is only
  // linked by the pages that embed homepage markup, because its resets are
  // wrong for everything else here.
  const homeStylesheet = embedsHomeMarkup
    ? '  <link rel="stylesheet" href="/assets/styles.css">\n'
    : '';
  const bodyClasses = ['lang-' + lang, 'site-page'];
  if (embedsHomeMarkup) bodyClasses.push('page--embedded');
  if (bodyClass) bodyClasses.push(bodyClass);
  const alternateLinks = alternates
    .map((alternate) => `  <link rel="alternate" hreflang="${alternate.hreflang}" href="${SITE_ORIGIN}${alternate.url}">`)
    .join('\n');
  const alternateLocales = LANGUAGES.filter((other) => other !== lang)
    .map((other) => `  <meta property="og:locale:alternate" content="${OG_LOCALE[other]}">`)
    .join('\n');

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeAttribute(title)}</title>
  <meta name="description" content="${escapeAttribute(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
${alternateLinks}
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="Data Governance Journey">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${OG_LOCALE[lang]}">
${alternateLocales}
  <meta property="og:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta property="og:image:width" content="${OG_IMAGE.width}">
  <meta property="og:image:height" content="${OG_IMAGE.height}">
  <meta property="og:image:alt" content="${escapeAttribute(OG_IMAGE.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta name="twitter:image:alt" content="${escapeAttribute(OG_IMAGE.alt)}">
  <link rel="preload" href="/assets/fonts/dm-serif-display-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/fonts-dm.css">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <meta name="theme-color" content="#003366">
  ${FONT_AWESOME}
${homeStylesheet}  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site-brand.css">
  <link rel="stylesheet" href="/assets/css/site-chrome.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
  <link rel="alternate" type="application/rss+xml" title="Data Governance Journey — ${escapeAttribute(
    nav.blog
  )}" href="${SITE_ORIGIN}${feedPath(lang)}">
${extraHead}  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-lang="${lang}" class="${bodyClasses.join(' ')}">
  <a class="skip-link" href="#${skipTarget}">${escapeAttribute(nav.skip)}</a>
  ${renderSiteHeader(lang, { current, languageHrefs })}
  <main id="${skipTarget}" tabindex="-1">
${main}
  </main>
  ${renderSiteFooter(lang)}
  <script type="module" src="/assets/js/site-nav.js"></script>
  <script type="module" src="/assets/js/share.js"></script>
${extraScripts}</body>
</html>
`;
};
