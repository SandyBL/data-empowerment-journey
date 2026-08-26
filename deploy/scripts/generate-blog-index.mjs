import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFrontMatter, renderMarkdown, readingTimeMinutes, escapeHtml } from './lib/markdown.mjs';
import { renderHomePage, HOME_PATH } from './lib/home-pages.mjs';
import { renderLlmsIndex, renderLlmsFull } from './lib/llms.mjs';
import { renderArticleSchema } from './lib/article-schema.mjs';
import { CATEGORY_LABELS, resolveCategory } from './lib/categories.mjs';
import { renderConfessionWalls } from './lib/confession-wall.mjs';
import { renderBlogIndexSchema } from './lib/blog-index-schema.mjs';
import { checkClassCoverage } from './check-class-coverage.mjs';
import { checkAssetIntegrity } from './check-asset-integrity.mjs';
import { LOGO, OG_IMAGE, PORTRAIT, SITE_ORIGIN, imageCdn } from './lib/brand.mjs';

/**
 * Whether this build is the one that answers on datagovjourney.com.
 *
 * Netlify sets CONTEXT to "production" only for the deploy that serves the
 * production domain; deploy previews and branch deploys get their own value and
 * their own hostname. Two things below depend on the difference: the production
 * build canonicalises the netlify.app hostnames onto the custom domain, and
 * every other build ships a site-wide noindex so a preview URL cannot compete
 * with the page it is previewing. Both are wrong if applied to the other
 * context — redirecting a preview away sends a reviewer to production, and
 * noindexing production removes the site from search.
 */
const IS_PRODUCTION_DEPLOY = process.env.CONTEXT === 'production';

const LANGUAGES = ['en', 'es', 'pt'];
const HTML_LANG = { en: 'en', es: 'es', pt: 'pt-BR' };
const OG_LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR' };
const DATE_LOCALE = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };

const LABELS = {
  en: {
    blogTitle: 'Journal / Insights',
    allArticles: 'All articles',
    home: 'Home',
    toc: 'On this page',
    minRead: 'min read',
    by: 'By',
    about: 'About the author',
    aboutText:
      'Data governance consultant and CDMP-certified practitioner helping organizations align people, processes, and technology around trusted data.',
    ctaKicker: 'Continue the journey',
    ctaTitle: 'Turn insight into a practical data capability.',
    ctaTools: 'Explore free tools →',
    ctaScorecard: 'Maturity Scorecard →',
    leadTitle: 'Put this into practice',
    leadText: 'Use our free data governance tools to turn the ideas in this article into action.',
    leadLink: 'Explore the tools →',
    skip: 'Skip to article',
    breadcrumbHome: 'Home',
    breadcrumbBlog: 'Insights',
    breadcrumb: 'Breadcrumb',
    languageNav: 'Language',
    relatedKicker: 'Keep reading',
    relatedTitle: 'Three more from the journal',
    relatedText: 'Articles that pick up where this one leaves off — chosen from the same track first, newest first after that.',
    relatedCue: 'Read article',
  },
  es: {
    blogTitle: 'Journal / Ideas',
    allArticles: 'Todos los artículos',
    home: 'Inicio',
    toc: 'En esta página',
    minRead: 'min de lectura',
    by: 'Por',
    about: 'Sobre el autor',
    aboutText:
      'Consultor de gobierno de datos y profesional certificado CDMP que ayuda a las organizaciones a alinear personas, procesos y tecnología en torno a datos confiables.',
    ctaKicker: 'Continúa el camino',
    ctaTitle: 'Convierte la idea en una capacidad de datos práctica.',
    ctaTools: 'Explorar herramientas gratuitas →',
    ctaScorecard: 'Scorecard de Madurez →',
    leadTitle: 'Lleva esto a la práctica',
    leadText: 'Usa nuestras herramientas gratuitas de gobierno de datos para convertir estas ideas en acción.',
    leadLink: 'Explorar las herramientas →',
    skip: 'Saltar al artículo',
    breadcrumbHome: 'Inicio',
    breadcrumbBlog: 'Ideas',
    breadcrumb: 'Ruta de navegación',
    languageNav: 'Idioma',
    relatedKicker: 'Seguir leyendo',
    relatedTitle: 'Tres lecturas más del journal',
    relatedText: 'Artículos que continúan donde termina este: primero los de la misma temática y después los más recientes.',
    relatedCue: 'Leer artículo',
  },
  pt: {
    blogTitle: 'Journal / Ideias',
    allArticles: 'Todos os artigos',
    home: 'Início',
    toc: 'Nesta página',
    minRead: 'min de leitura',
    by: 'Por',
    about: 'Sobre o autor',
    aboutText:
      'Consultor de governança de dados e profissional certificado CDMP que ajuda organizações a alinhar pessoas, processos e tecnologia em torno de dados confiáveis.',
    ctaKicker: 'Continue a jornada',
    ctaTitle: 'Transforme a ideia em uma capacidade prática de dados.',
    ctaTools: 'Explorar ferramentas gratuitas →',
    ctaScorecard: 'Scorecard de Maturidade →',
    leadTitle: 'Coloque isso em prática',
    leadText: 'Use nossas ferramentas gratuitas de governança de dados para transformar estas ideias em ação.',
    leadLink: 'Explorar as ferramentas →',
    skip: 'Ir para o artigo',
    breadcrumbHome: 'Início',
    breadcrumbBlog: 'Ideias',
    breadcrumb: 'Trilha de navegação',
    languageNav: 'Idioma',
    relatedKicker: 'Continue lendo',
    relatedTitle: 'Mais três leituras do journal',
    relatedText: 'Artigos que seguem de onde este parou: primeiro os do mesmo tema e depois os mais recentes.',
    relatedCue: 'Ler artigo',
  },
};

/**
 * Dates for the sitemap entries that have no front matter to read one from.
 *
 * Every sitemap entry needs a <lastmod>, and articles supply their own. The
 * static pages have no such field, and file timestamps are useless here because
 * a fresh checkout stamps every file with the build time — which would announce
 * that the whole site changed on every deploy and teach crawlers to ignore the
 * signal.
 *
 * There used to be one constant covering all of them, which meant every static
 * page claimed the same revision date and none of them moved unless somebody
 * remembered to bump it by hand. A lastmod nobody maintains is worse than no
 * lastmod: Google learns the value is noise and stops using it to schedule
 * recrawls, which is precisely the signal a small site cannot afford to lose.
 *
 * So each group now takes its date from whatever actually changes it:
 *
 *   homepages       derived — they carry the latest-articles block, so they
 *                   genuinely change whenever an article is published
 *   blog indexes    derived — newest article in that language (see renderSitemap)
 *   category pages  derived — newest article in that category and language
 *   confession walls  the constant below: the seeded stories are compiled from
 *                   assets/js/confession-wall-content.js, and published
 *                   submissions hydrate client-side without changing the HTML
 *   simulators      the constant below: nine hand-maintained single-file pages
 *
 * The two constants that remain are the two that genuinely have no derivable
 * source. Bump them when the copy on those pages actually changes.
 */
const CONFESSION_WALL_LAST_MODIFIED = '2026-08-08';
const SIMULATOR_LAST_MODIFIED = '2026-08-08';

/**
 * Non-article URLs that belong in the sitemap.
 *
 * Each language's homepage is its own page — Spanish at "/", English at "/en/",
 * Portuguese at "/pt/" — so all three are listed, each declaring the other two
 * as hreflang alternates.
 */
const STATIC_ROUTES = [
  ...LANGUAGES.map((lang) => ({
    url: HOME_PATH[lang],
    priority: lang === 'es' ? '1.0' : '0.9',
    changefreq: 'weekly',
    // Derived in renderSitemap from the newest article on the site.
    lastmod: null,
    alternates: [
      ...LANGUAGES.map((other) => ({ hreflang: other, url: HOME_PATH[other] })),
      // "/" rather than "/en/": it is the address that negotiates, so it is the
      // address for a visitor whose language none of the three match. Kept in
      // step with the head of the page itself — see scripts/lib/home-pages.mjs.
      { hreflang: 'x-default', url: HOME_PATH.es },
    ],
  })),
  ...['blog', 'confession-wall'].flatMap((section) =>
    LANGUAGES.map((lang) => ({
      url: `/${lang}/${section}/`,
      priority: section === 'blog' ? '0.8' : '0.7',
      changefreq: 'weekly',
      // Blog indexes are derived in renderSitemap; the walls take the constant.
      lastmod: section === 'blog' ? null : CONFESSION_WALL_LAST_MODIFIED,
      alternates: [
        ...LANGUAGES.map((other) => ({ hreflang: other, url: `/${other}/${section}/` })),
        { hreflang: 'x-default', url: `/en/${section}/` },
      ],
    }))
  ),
  ...['data-governance-day-to-day', 'data-ownership-conflict', 'data-literacy'].flatMap((simulator) =>
    LANGUAGES.map((lang) => ({
      url: `/simulators/${lang}/${simulator}/`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: SIMULATOR_LAST_MODIFIED,
      alternates: [
        ...LANGUAGES.map((other) => ({ hreflang: other, url: `/simulators/${other}/${simulator}/` })),
        { hreflang: 'x-default', url: `/simulators/en/${simulator}/` },
      ],
    }))
  ),
];

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = path.join(projectDirectory, 'content/blog');

const formatDate = (isoDate, lang) =>
  new Intl.DateTimeFormat(DATE_LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(`${isoDate}T12:00:00Z`)
  );

const articlePath = (lang, slug) => `/${lang}/blog/${slug}/`;
const categoryPath = (lang, key) => `/${lang}/blog/category/${key}/`;

/**
 * How many articles a category needs, in every language, before it gets a page.
 *
 * A category hub earns its place by being a second route into articles that
 * otherwise hang off one listing page. A hub over one or two articles is not
 * that: it is a near-empty page whose only content is a link to a page the
 * reader could already reach, which is the shape Google files under "crawled -
 * currently not indexed". Requiring the threshold in *every* language rather
 * than in any one of them also keeps the hreflang cluster complete, so the
 * three hubs for a category always point at each other.
 */
const CATEGORY_PAGE_MINIMUM = 3;

/** Copy the category hubs need that the article and listing pages do not. */
const CATEGORY_COPY = {
  en: {
    skip: 'Skip to the articles',
    kicker: 'Category',
    lead: (label) =>
      `Everything we have published on ${label}, newest first — written for the people who have to make it work day to day.`,
    metaTitle: (label) => `${label} — Articles | Data Governance Journey`,
    metaDescription: (label) =>
      `Every Data Governance Journey article on ${label}: practical guidance on turning the principles into decisions, routines, and outcomes.`,
    count: (total) => `${total} ${total === 1 ? 'article' : 'articles'}`,
    browse: 'Browse by category',
  },
  es: {
    skip: 'Saltar a los artículos',
    kicker: 'Categoría',
    lead: (label) =>
      `Todo lo que hemos publicado sobre ${label}, empezando por lo más reciente y escrito para quienes tienen que aplicarlo cada día.`,
    metaTitle: (label) => `${label} — Artículos | Data Governance Journey`,
    metaDescription: (label) =>
      `Todos los artículos de Data Governance Journey sobre ${label}: guía práctica para convertir los principios en decisiones, rutinas y resultados.`,
    count: (total) => `${total} ${total === 1 ? 'artículo' : 'artículos'}`,
    browse: 'Explorar por categoría',
  },
  pt: {
    skip: 'Ir para os artigos',
    kicker: 'Categoria',
    lead: (label) =>
      `Tudo o que publicamos sobre ${label}, do mais recente ao mais antigo, escrito para quem precisa aplicar isso no dia a dia.`,
    metaTitle: (label) => `${label} — Artigos | Data Governance Journey`,
    metaDescription: (label) =>
      `Todos os artigos da Data Governance Journey sobre ${label}: orientação prática para transformar os princípios em decisões, rotinas e resultados.`,
    count: (total) => `${total} ${total === 1 ? 'artigo' : 'artigos'}`,
    browse: 'Navegar por categoria',
  },
};

/**
 * The category hubs this build should publish, one entry per language.
 *
 * Returns an empty list rather than a partial one when nothing clears
 * CATEGORY_PAGE_MINIMUM, so a site with a shallow taxonomy simply has no hubs
 * instead of a scattering of one-link pages.
 */
function collectCategoryPages(articles) {
  const grouped = new Map();
  for (const article of articles) {
    if (!article.categoryKey) continue;
    if (!grouped.has(article.categoryKey)) grouped.set(article.categoryKey, new Map());
    const languages = grouped.get(article.categoryKey);
    if (!languages.has(article.lang)) languages.set(article.lang, []);
    languages.get(article.lang).push(article);
  }

  const pages = [];
  for (const key of Object.keys(CATEGORY_LABELS)) {
    const languages = grouped.get(key);
    if (!languages) continue;
    if (!LANGUAGES.every((lang) => (languages.get(lang) || []).length >= CATEGORY_PAGE_MINIMUM)) continue;
    for (const lang of LANGUAGES) {
      pages.push({
        lang,
        key,
        label: CATEGORY_LABELS[key][lang],
        url: categoryPath(lang, key),
        articles: [...languages.get(lang)].sort((first, second) => second.date.localeCompare(first.date)),
      });
    }
  }
  return pages;
}

/**
 * The row of category links shown on the blog index and on every hub.
 *
 * This is the inbound half of the hub: without it the only crawlable route to
 * a category page would be the sitemap and the chip on an article, and a page
 * whose only referrer is the sitemap is exactly the "discovered - currently not
 * indexed" case. Rendered as nothing at all when no category qualifies.
 */
function renderCategoryNav(lang, categoryPages, currentKey) {
  const localized = categoryPages.filter((page) => page.lang === lang);
  if (!localized.length) return '';
  const labels = LABELS[lang];
  const copy = CATEGORY_COPY[lang];
  const links = [
    `<a href="/${lang}/blog/"${currentKey ? '' : ' aria-current="page"'}>${labels.allArticles}</a>`,
    ...localized.map(
      (page) =>
        `<a href="${page.url}"${page.key === currentKey ? ' aria-current="page"' : ''}>${escapeHtml(page.label)}</a>`
    ),
  ].join('');
  return `<nav class="category-nav blog-shell" aria-label="${copy.browse}"><span class="category-nav-label">${copy.browse}</span><div class="category-nav-links">${links}</div></nav>`;
}

function renderCategoryPage(page, categoryPages) {
  const { lang, label } = page;
  const labels = LABELS[lang];
  const copy = CATEGORY_COPY[lang];
  const canonical = `${SITE_ORIGIN}${page.url}`;
  const description = copy.metaDescription(label);

  const alternates = [
    ...LANGUAGES.map(
      (other) =>
        `<link rel="alternate" hreflang="${other}" href="${SITE_ORIGIN}${categoryPath(other, page.key)}">`
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${categoryPath('en', page.key)}">`,
  ].join('');

  const languageNav = LANGUAGES.map(
    (other) =>
      `<a href="${categoryPath(other, page.key)}"${other === lang ? ' aria-current="page"' : ''}>${other.toUpperCase()}</a>`
  ).join('');

  const breadcrumb = [
    { name: labels.breadcrumbHome, item: `${SITE_ORIGIN}${HOME_PATH[lang]}` },
    { name: labels.breadcrumbBlog, item: `${SITE_ORIGIN}/${lang}/blog/` },
    { name: label, item: canonical },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonical}#page`,
        url: canonical,
        name: `${label} — Data Governance Journey`,
        description,
        inLanguage: HTML_LANG[lang],
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        mainEntity: { '@id': `${canonical}#articles` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: breadcrumb.map((step, position) => ({
          '@type': 'ListItem',
          position: position + 1,
          name: step.name,
          item: step.item,
        })),
      },
      {
        '@type': 'ItemList',
        '@id': `${canonical}#articles`,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: page.articles.length,
        itemListElement: page.articles.map((article, position) => ({
          '@type': 'ListItem',
          position: position + 1,
          url: `${SITE_ORIGIN}${articlePath(lang, article.slug)}`,
          name: article.title,
        })),
      },
    ],
  };

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(copy.metaTitle(label))}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  ${alternates}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(copy.metaTitle(label))}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Data Governance Journey">
  <meta property="og:locale" content="${OG_LOCALE[lang]}">
  <meta property="og:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta property="og:image:width" content="${OG_IMAGE.width}">
  <meta property="og:image:height" content="${OG_IMAGE.height}">
  <meta property="og:image:alt" content="${escapeHtml(OG_IMAGE.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(copy.metaTitle(label))}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta name="twitter:image:alt" content="${escapeHtml(OG_IMAGE.alt)}">
  <link rel="preload" href="/assets/fonts/dm-serif-display-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/fonts-dm.css">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <meta name="theme-color" content="#003366">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site-brand.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-lang="${lang}">
  <a class="skip-link" href="#articles">${copy.skip}</a>
  <header class="blog-header"><nav class="blog-nav blog-shell" aria-label="Primary navigation"><a class="blog-brand" href="${HOME_PATH[lang]}"><img src="${imageCdn(LOGO.url, 80, 78)}" alt="Data Governance Journey" width="40" height="40" fetchpriority="high" decoding="async"><span class="blog-wordmark">Data Governance Journey</span></a><a class="blog-nav-center" href="/${lang}/blog/">${labels.blogTitle}</a><div class="blog-nav-actions"><a class="home-link" href="/${lang}/blog/">${labels.allArticles}</a><div class="language-nav" role="navigation" aria-label="${labels.languageNav}">${languageNav}</div></div></nav></header>
  <main id="articles" tabindex="-1">
    <section class="listing-intro blog-shell"><div>${renderBreadcrumbNav(breadcrumb, labels)}<span class="blog-kicker">${copy.kicker}</span><h1>${escapeHtml(label)}</h1></div><p>${escapeHtml(copy.lead(label))}</p></section>
    ${renderCategoryNav(lang, categoryPages, page.key)}
    <section class="blog-shell"><div class="section-heading"><h2>${escapeHtml(label)}</h2><span>${copy.count(page.articles.length)}</span></div>
      <div class="post-grid">${page.articles.map((article) => renderArchiveCard(article)).join('')}</div>
    </section>
    <aside class="tools-cta article-cta blog-shell"><div><small>${labels.ctaKicker}</small><h2>${labels.ctaTitle}</h2></div><div class="cta-actions"><a class="cta-button" href="${HOME_PATH[lang]}#recursos">${labels.ctaTools}</a><a class="cta-button cta-button-secondary" href="${HOME_PATH[lang]}#scorecard">${labels.ctaScorecard}</a></div></aside>
  </main>
  <footer class="blog-footer blog-shell">© ${new Date().getUTCFullYear()} Data Governance Journey</footer>
  <script type="module" src="/assets/js/language-switch.js"></script>
  <script src="/assets/js/web-vitals.js" defer></script>
</body>
</html>
`;
}


/**
 * Accepts an old slug however an editor supplies it — bare, as a full path, or
 * as the Markdown filename — and reduces it to the slug itself.
 */
const normalizeSlug = (value) =>
  String(value)
    .trim()
    .replace(/\.md$/, '')
    .split('/')
    .filter(Boolean)
    .pop() || '';

const normalizeSearchText = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * The people who can appear as an author, and nothing else.
 *
 * Every article schema points its author at the same `#sandy-bradbury` @id, so
 * whatever front matter says becomes the name of that one entity. Some files
 * said "Sandy Bradbury" and others "Sandy Bradbury / Data Governance Journey",
 * which published one identifier under two names and folded the organisation
 * into the person \u2014 exactly the ambiguity the shared @id exists to remove. The
 * publisher is already carried separately, so the person is just the person,
 * and an unrecognised value fails the build rather than reaching a page.
 */
const KNOWN_AUTHORS = ['Sandy Bradbury'];

function resolveAuthor(value, source) {
  const author = (value || KNOWN_AUTHORS[0]).trim();
  if (!KNOWN_AUTHORS.includes(author)) {
    throw new Error(
      `Unknown author "${author}" in ${source}. Author must be one of: ${KNOWN_AUTHORS.join(', ')}. ` +
        'The organisation is published separately as the schema publisher and does not belong in this field.'
    );
  }
  return author;
}

async function loadArticles() {
  const articles = [];
  for (const lang of LANGUAGES) {
    const files = (await readdir(path.join(contentDirectory, lang))).filter((file) => file.endsWith('.md')).sort();
    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      const source = await readFile(path.join(contentDirectory, lang, file), 'utf8');
      const { attributes, body } = parseFrontMatter(source);
      if (!attributes.title || !attributes.date) {
        throw new Error(`Missing title or date in content/blog/${lang}/${file}`);
      }
      const { html, headings } = renderMarkdown(body);
      // Front matter stores a language-neutral category key; the label people
      // read is resolved per language so a page never mixes languages.
      const category = resolveCategory(attributes.category, lang, `content/blog/${lang}/${file}`);
      articles.push({
        lang,
        slug,
        file,
        title: attributes.title,
        summary: attributes.summary || '',
        category: category.label,
        categoryKey: category.key,
        author: resolveAuthor(attributes.author, `content/blog/${lang}/${file}`),
        date: attributes.date,
        // Schema and the sitemap both need a modified date. Without one the two
        // dates were identical on every article, which tells a crawler nothing
        // about whether a page is worth recrawling.
        updated: attributes.updated || attributes.date,
        translationKey: attributes.translation_key || slug,
        redirectFrom: [attributes.redirect_from ?? []].flat().map(normalizeSlug).filter(Boolean),
        readingTime: readingTimeMinutes(body),
        body: body.trim(),
        bodyHtml: html,
        headings,
        searchText: normalizeSearchText(`${attributes.title} ${category.label} ${attributes.summary} ${body}`),
      });
    }
  }
  return articles;
}

/** Maps a translation key to the per-language article that implements it. */
function buildTranslationMap(articles) {
  const map = new Map();
  for (const article of articles) {
    if (!map.has(article.translationKey)) map.set(article.translationKey, {});
    map.get(article.translationKey)[article.lang] = article;
  }
  return map;
}

function renderAlternates(translations, fallbackLang) {
  const links = LANGUAGES.filter((lang) => translations[lang]).map(
    (lang) =>
      `<link rel="alternate" hreflang="${lang}" href="${SITE_ORIGIN}${articlePath(lang, translations[lang].slug)}">`
  );
  const defaultArticle = translations.en || translations[fallbackLang];
  links.push(
    `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${articlePath(defaultArticle.lang, defaultArticle.slug)}">`
  );
  return links.join('');
}

function renderTableOfContents(headings, label) {
  if (!headings.length) return '';
  const items = headings
    .map(
      (heading) =>
        `<li${heading.level === 3 ? ' class="toc-subitem"' : ''}><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`
    )
    .join('');
  return `<aside class="toc" aria-label="${label}"><strong>${label}</strong><ol>${items}</ol></aside>`;
}

/**
 * Renders the breadcrumb trail the BreadcrumbList schema describes.
 *
 * The trail existed only as JSON-LD. Google asks that structured data reflect
 * something the page actually shows, and a reader arriving from a search result
 * deep in the blog had no visible route back up, so the same array now renders
 * as markup and as schema.
 */
function renderBreadcrumbNav(breadcrumb, labels) {
  const items = breadcrumb
    .map((step, position) => {
      const isLast = position === breadcrumb.length - 1;
      const label = escapeHtml(step.name);
      // The current page is its own breadcrumb tail; linking it to itself adds
      // a self-referencing link and nothing a reader can use.
      const content = isLast ? `<span aria-current="page">${label}</span>` : `<a href="${step.item}">${label}</a>`;
      return `<li>${content}</li>`;
    })
    .join('');
  return `<nav class="article-breadcrumb" aria-label="${labels.breadcrumb}"><ol>${items}</ol></nav>`;
}

/**
 * Splices the lead-magnet callout after the fourth paragraph, matching the
 * placement the client-side renderer used before articles became static.
 */
function insertLeadMagnet(bodyHtml, labels) {
  const callout = `<aside class="article-lead-magnet" aria-label="${labels.leadTitle}"><span>FIELD NOTE / 01</span><h2>${labels.leadTitle}</h2><p>${labels.leadText}</p><a href="/#recursos">${labels.leadLink}</a></aside>`;
  const paragraphs = [...bodyHtml.matchAll(/<\/p>/g)];
  if (!paragraphs.length) return `${bodyHtml}${callout}`;
  const anchor = paragraphs[Math.min(3, paragraphs.length - 1)];
  const position = anchor.index + anchor[0].length;
  return `${bodyHtml.slice(0, position)}${callout}${bodyHtml.slice(position)}`;
}

/**
 * Renders the "keep reading" section: three articles in the reader's language,
 * same category first and newest after that.
 *
 * Each card is one link wrapping the whole surface, so the category, title,
 * summary and meta are all part of the same target rather than a bare list item
 * with a link buried in it. The heading carries an id the section points at with
 * aria-labelledby, which is what names the region for a screen reader.
 */
function renderRelated(article, articles, labels) {
  const related = articles
    .filter((candidate) => candidate.lang === article.lang && candidate.slug !== article.slug)
    .sort((first, second) => {
      const sameCategory =
        Number(second.categoryKey === article.categoryKey) - Number(first.categoryKey === article.categoryKey);
      return sameCategory || second.date.localeCompare(first.date);
    })
    .slice(0, 3);
  if (!related.length) return '';
  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
  const items = related
    .map(
      (item, index) =>
        `<li class="related-card"><a href="${articlePath(item.lang, item.slug)}"><span class="related-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="related-category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}<span class="related-meta"><time datetime="${item.date}">${formatDate(item.date, item.lang)}</time><span>${item.readingTime} ${labels.minRead}</span></span><span class="related-cue">${labels.relatedCue}${arrow}</span></a></li>`
    )
    .join('');
  return `<section class="related-articles blog-shell" aria-labelledby="keep-reading">
      <div class="related-head">
        <div><span class="blog-kicker">${labels.relatedKicker}</span><h2 id="keep-reading">${labels.relatedTitle}</h2><p>${labels.relatedText}</p></div>
        <a class="related-all" href="/${article.lang}/blog/">${labels.allArticles}${arrow}</a>
      </div>
      <ul class="related-grid">${items}</ul>
    </section>`;
}

function renderArticlePage(article, translations, articles, categoryHubs) {
  const labels = LABELS[article.lang];
  const canonical = `${SITE_ORIGIN}${articlePath(article.lang, article.slug)}`;
  const description = article.summary || article.title;
  const bodyHtml = insertLeadMagnet(article.bodyHtml, labels);

  const languageNav = LANGUAGES.map((lang) => {
    const target = translations[lang];
    const href = target ? articlePath(lang, target.slug) : `/${lang}/blog/`;
    const current = lang === article.lang ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${lang.toUpperCase()}</a>`;
  }).join('');

  // The category step is only in the trail when there is a page behind it.
  // Google asks that a breadcrumb describe a route the reader can actually
  // take, and renderBreadcrumbNav renders every non-final step as a link, so a
  // step for a category with no hub would be a link to nowhere.
  const hasCategoryHub = categoryHubs.has(article.categoryKey);
  const breadcrumb = [
    { name: labels.breadcrumbHome, item: `${SITE_ORIGIN}${HOME_PATH[article.lang]}` },
    { name: labels.breadcrumbBlog, item: `${SITE_ORIGIN}/${article.lang}/blog/` },
    ...(hasCategoryHub
      ? [{ name: article.category, item: `${SITE_ORIGIN}${categoryPath(article.lang, article.categoryKey)}` }]
      : []),
    { name: article.title, item: canonical },
  ];

  const schema = renderArticleSchema({
    article,
    canonical,
    homeUrl: `${SITE_ORIGIN}${HOME_PATH[article.lang]}`,
    htmlLanguage: HTML_LANG[article.lang],
    blogName: `${labels.blogTitle} — Data Governance Journey`,
    breadcrumb,
  });

  return `<!doctype html>
<html lang="${HTML_LANG[article.lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.title)} | Data Governance Journey</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${escapeHtml(article.author)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  ${renderAlternates(translations, article.lang)}
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Data Governance Journey">
  <meta property="og:locale" content="${OG_LOCALE[article.lang]}">
  <meta property="og:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta property="og:image:width" content="${OG_IMAGE.width}">
  <meta property="og:image:height" content="${OG_IMAGE.height}">
  <meta property="og:image:alt" content="${escapeHtml(OG_IMAGE.alt)}">
  <meta property="article:published_time" content="${article.date}">
  <meta property="article:modified_time" content="${article.updated}">
  <meta property="article:author" content="${escapeHtml(article.author)}">
  <meta property="article:section" content="${escapeHtml(article.category)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.title)} | Data Governance Journey">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta name="twitter:image:alt" content="${escapeHtml(OG_IMAGE.alt)}">
  <link rel="preload" href="/assets/fonts/dm-serif-display-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/fonts-dm.css">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <meta name="theme-color" content="#003366">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site-brand.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-lang="${article.lang}" class="article-ready">
  <a class="skip-link" href="#article">${labels.skip}</a>
  <header class="blog-header"><nav class="blog-nav blog-shell" aria-label="Primary navigation"><a class="blog-brand" href="${HOME_PATH[article.lang]}"><img src="${imageCdn(LOGO.url, 80, 78)}" alt="Data Governance Journey" width="40" height="40" fetchpriority="high" decoding="async"><span class="blog-wordmark">Data Governance Journey</span></a><a class="blog-nav-center" href="/${article.lang}/blog/">${labels.blogTitle}</a><div class="blog-nav-actions"><a class="home-link" href="/${article.lang}/blog/">${labels.allArticles}</a><div class="language-nav" role="navigation" aria-label="${labels.languageNav}">${languageNav}</div></div></nav></header>
  <main id="article" tabindex="-1">
    <header class="article-hero blog-shell">
      ${renderBreadcrumbNav(breadcrumb, labels)}
      ${hasCategoryHub ? `<a class="blog-kicker" href="${categoryPath(article.lang, article.categoryKey)}">${escapeHtml(article.category)}</a>` : `<span class="blog-kicker">${escapeHtml(article.category)}</span>`}
      <h1>${escapeHtml(article.title)}</h1>
      <p class="article-deck">${escapeHtml(article.summary)}</p>
      <div class="article-byline"><span>${labels.by} <strong>${escapeHtml(article.author)}</strong></span><time datetime="${article.date}">${formatDate(article.date, article.lang)}</time><span>${article.readingTime} ${labels.minRead}</span></div>
    </header>
    <div class="article-layout">
      ${renderTableOfContents(article.headings, labels.toc)}
      <div>
        <article class="article-body">
${bodyHtml}
        </article>
        <aside class="author-card" aria-label="${labels.about}"><img src="${imageCdn(PORTRAIT.url, 192, 192, 'cover')}" alt="Sandy Bradbury, Lead Data Governance Consultant" width="96" height="96" loading="lazy" decoding="async"><div><small>${labels.about}</small><h2>Sandy Bradbury</h2><p>${labels.aboutText}</p></div></aside>
      </div>
    </div>
    ${renderRelated(article, articles, labels)}
    <aside class="tools-cta article-cta blog-shell"><div><small>${labels.ctaKicker}</small><h2>${labels.ctaTitle}</h2></div><div class="cta-actions"><a class="cta-button" href="${HOME_PATH[article.lang]}#recursos">${labels.ctaTools}</a><a class="cta-button cta-button-secondary" href="${HOME_PATH[article.lang]}#scorecard">${labels.ctaScorecard}</a></div></aside>
  </main>
  <footer class="blog-footer blog-shell">© ${new Date().getUTCFullYear()} Data Governance Journey</footer>
  <script type="module" src="/assets/js/language-switch.js"></script>
  <script src="/assets/js/web-vitals.js" defer></script>
</body>
</html>
`;
}

function renderArchiveCard(article, { hero = false } = {}) {
  const href = articlePath(article.lang, article.slug);
  // The full article text used to ride along in a data-search attribute — around
  // 4 KB of duplicated, invisible prose per card. A crawler that reads raw HTML
  // saw every archive page as its articles pasted end to end, which buries the
  // page's real content. The corpus now lives in /assets/search/<lang>.json,
  // which only the search script fetches.
  const attributes = [
    `data-post-path="/content/blog/${article.lang}/${article.file}"`,
    `data-slug="${article.slug}"`,
    `data-title="${escapeHtml(article.title)}"`,
    `data-category="${escapeHtml(article.category)}"`,
    `data-date="${article.date}"`,
  ].join(' ');

  if (hero) {
    return `<article class="hero-post is-loaded" ${attributes}><div class="hero-post-content"><span class="post-category">${escapeHtml(article.category)}</span><h2><a href="${href}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.summary)}</p><div class="post-meta"><time datetime="${article.date}">${formatDate(article.date, article.lang)}</time><span>${article.readingTime} ${LABELS[article.lang].minRead}</span></div></div></article>`;
  }

  return `<article class="post-card is-loaded" ${attributes}><span class="post-category">${escapeHtml(article.category)}</span><h2><a href="${href}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.summary)}</p><div class="post-meta"><time datetime="${article.date}">${formatDate(article.date, article.lang)}</time><span>${article.readingTime} ${LABELS[article.lang].minRead}</span></div></article>`;
}

function replaceBetweenMarkers(source, marker, replacement, filePath) {
  const start = `<!-- ${marker}:START -->`;
  const end = `<!-- ${marker}:END -->`;
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`Missing ${marker} markers in ${filePath}`);
  }
  return `${source.slice(0, startIndex + start.length)}${replacement}${source.slice(endIndex)}`;
}

/**
 * Renders the archive listing into each blog index so crawlers see real links.
 *
 * The newest article is also promoted into the featured slot at the top of the
 * page, but it stays in the archive grid below: that section is titled "All
 * articles", and the script that powers the search, category filter, sort and
 * result counter only ever reads `.post-card` elements from the grid. Handing
 * the featured article to the hero *instead of* the grid is what used to make a
 * six-article blog report "5 articles" and hide the newest one from every
 * filter — the one article an editor has just published being the one the page
 * could not find.
 */
async function updateBlogIndexes(articles, categoryPages) {
  for (const lang of LANGUAGES) {
    const indexPath = path.join(projectDirectory, lang, 'blog', 'index.html');
    const localized = articles
      .filter((article) => article.lang === lang)
      .sort((first, second) => second.date.localeCompare(first.date));
    const [hero] = localized;

    let source = await readFile(indexPath, 'utf8');
    source = replaceBetweenMarkers(
      source,
      'BLOG_HERO',
      hero ? renderArchiveCard(hero, { hero: true }) : '',
      indexPath
    );
    source = replaceBetweenMarkers(
      source,
      'BLOG_ARCHIVE',
      localized.map((article) => renderArchiveCard(article)).join(''),
      indexPath
    );
    source = replaceBetweenMarkers(
      source,
      'BLOG_CATEGORIES',
      renderCategoryNav(lang, categoryPages, ''),
      indexPath
    );
    source = replaceBetweenMarkers(
      source,
      'BLOG_SCHEMA',
      renderBlogIndexSchema(lang, HTML_LANG[lang], localized, LABELS[lang]),
      indexPath
    );
    // The footer year is generated for the same reason the article pages
    // generate theirs: a literal year is right for twelve months and then makes
    // the site look abandoned, and nobody reviews a copyright line.
    source = replaceBetweenMarkers(
      source,
      'BLOG_FOOTER',
      `<footer class="blog-footer blog-shell">© ${new Date().getUTCFullYear()} Data Governance Journey</footer>`,
      indexPath
    );
    assertArchiveIsComplete(source, localized, indexPath);
    await writeFile(indexPath, source, 'utf8');
  }
}

/**
 * Fails the build if a published article is missing from an archive page.
 *
 * This checks the rendered HTML rather than the array it was rendered from, so
 * it catches a card that the template dropped as well as one the listing never
 * selected. Silent omission is the failure mode worth guarding: nothing else
 * about the page looks broken when an article simply is not there.
 */
function assertArchiveIsComplete(source, localized, indexPath) {
  const cards = source.matchAll(/<article class="post-card[^"]*"[^>]*data-slug="([^"]+)"/g);
  const rendered = new Set([...cards].map((match) => match[1]));
  const missing = localized.filter((article) => !rendered.has(article.slug));
  if (missing.length) {
    throw new Error(
      `${indexPath} lists ${rendered.size} of ${localized.length} published articles; missing: ${missing
        .map((article) => article.slug)
        .join(', ')}`
    );
  }
}

/**
 * Writes the search corpus the archive script fetches on demand.
 *
 * One file per language, keyed by slug, so a visitor searching the English
 * archive never downloads the Spanish and Portuguese text.
 */
async function writeSearchIndexes(articles) {
  const searchDirectory = path.join(projectDirectory, 'assets/search');
  await mkdir(searchDirectory, { recursive: true });

  for (const lang of LANGUAGES) {
    const corpus = {};
    for (const article of articles.filter((entry) => entry.lang === lang)) {
      corpus[article.slug] = article.searchText.slice(0, 4000);
    }
    await writeFile(path.join(searchDirectory, `${lang}.json`), `${JSON.stringify(corpus)}\n`, 'utf8');
  }
}

function renderSitemap(articles, translationMap, categoryPages) {
  const entries = [];

  const escapeUrl = (url) => `${SITE_ORIGIN}${url}`.replace(/&/g, '&amp;');

  // A page that lists articles changes whenever one of the articles it lists
  // changes, so its own newest revision date is a truer lastmod than any
  // hand-maintained constant. `updated` rather than `date`: republishing an
  // article is exactly the event a listing page needs to report.
  const newestRevision = new Map();
  const noteRevision = (route, revision) => {
    if (revision > (newestRevision.get(route) || '')) newestRevision.set(route, revision);
  };
  for (const article of articles) {
    noteRevision(`/${article.lang}/blog/`, article.updated);
    noteRevision(categoryPath(article.lang, article.categoryKey), article.updated);
    // The homepages carry the latest-articles block, so any article revision
    // changes all three of them.
    for (const lang of LANGUAGES) noteRevision(HOME_PATH[lang], article.updated);
  }

  for (const route of STATIC_ROUTES) {
    // A route with `lastmod: null` declares that its date is derived. Falling
    // back to the build date would republish it on every deploy, so an
    // underived route is a bug worth failing on rather than papering over.
    const lastmod = route.lastmod ?? newestRevision.get(route.url);
    if (!lastmod) throw new Error(`No lastmod could be derived for the sitemap entry ${route.url}`);
    entries.push(
      [
        '  <url>',
        `    <loc>${escapeUrl(route.url)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...route.alternates.map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeUrl(alternate.url)}"/>`
        ),
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority}</priority>`,
        '  </url>',
      ].join('\n')
    );
  }

  for (const page of categoryPages) {
    const alternates = [
      ...LANGUAGES.map(
        (other) =>
          `    <xhtml:link rel="alternate" hreflang="${other}" href="${escapeUrl(categoryPath(other, page.key))}"/>`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeUrl(categoryPath('en', page.key))}"/>`,
    ];
    const lastmod = newestRevision.get(page.url);
    if (!lastmod) throw new Error(`No lastmod could be derived for the sitemap entry ${page.url}`);
    entries.push(
      [
        '  <url>',
        `    <loc>${escapeUrl(page.url)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...alternates,
        '    <changefreq>weekly</changefreq>',
        // Below the blog index (0.8) and above an individual article (0.7): a
        // hub is a route to the articles, not a destination that outranks them.
        '    <priority>0.75</priority>',
        '  </url>',
      ].join('\n')
    );
  }

  for (const article of articles) {
    const translations = translationMap.get(article.translationKey);
    const alternates = LANGUAGES.filter((lang) => translations[lang]).map(
      (lang) =>
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_ORIGIN}${articlePath(lang, translations[lang].slug)}"/>`
    );
    const fallback = translations.en || article;
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${articlePath(fallback.lang, fallback.slug)}"/>`
    );
    entries.push(
      [
        '  <url>',
        `    <loc>${SITE_ORIGIN}${articlePath(article.lang, article.slug)}</loc>`,
        // `updated`, not `date`. These disagreed for as long as an article had
        // been revised, and the sitemap was the one reporting the stale figure:
        // the page's own article:modified_time and JSON-LD dateModified already
        // carried `updated`, so editing an article changed everything Google
        // reads on the page and nothing it uses to decide whether to refetch it.
        `    <lastmod>${article.updated}</lastmod>`,
        ...alternates,
        '    <changefreq>monthly</changefreq>',
        '    <priority>0.7</priority>',
        '  </url>',
      ].join('\n')
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

/**
 * Collects the slugs published articles used to live at, keyed by language.
 *
 * Renaming a Markdown file changes the article's URL and deletes the directory
 * behind the old one, so without these the previous address becomes a hard 404
 * for anyone holding a link to it. Two articles claiming the same old slug, or
 * one claiming a slug a live article already occupies, would make the forced
 * redirect shadow a real page — both fail the build rather than ship quietly.
 */
function collectRenames(articles) {
  const liveSlugs = new Set(articles.map((article) => `${article.lang}/${article.slug}`));
  const renames = [];
  const claimed = new Map();

  for (const article of articles) {
    for (const previousSlug of article.redirectFrom) {
      const key = `${article.lang}/${previousSlug}`;
      if (liveSlugs.has(key)) {
        throw new Error(
          `content/blog/${article.lang}/${article.file} lists "${previousSlug}" as a previous URL, but that is the address of a published article.`
        );
      }
      if (claimed.has(key)) {
        throw new Error(
          `content/blog/${article.lang}/${article.file} and ${claimed.get(key)} both list "${previousSlug}" as a previous URL; only one article can own it.`
        );
      }
      claimed.set(key, `content/blog/${article.lang}/${article.file}`);
      renames.push({ lang: article.lang, previousSlug, target: articlePath(article.lang, article.slug) });
    }
  }
  return renames;
}

/**
 * Rewrites the legacy query-string article URLs to their static equivalents,
 * and collapses every other address that serves a page we already publish.
 *
 * `canonicalRoutes` is every directory-style URL the sitemap declares. Each one
 * is reachable at a second address — `/en/blog/` and `/en/blog/index.html` are
 * the same bytes — and Search Console files the second copy under "alternate
 * page with proper canonical tag". Netlify's pretty_urls setting is supposed to
 * collapse those, but it is not doing so on this site, so the rules are emitted
 * explicitly rather than trusted to a toggle.
 */
function renderRedirects(articles, renames, canonicalRoutes) {
  const lines = [
    '# Canonical host: force HTTPS on the apex domain.',
    'http://datagovjourney.com/* https://datagovjourney.com/:splat 301!',
    '',
    '# The homepage used to serve all three languages from "/" and switch between',
    '# them with ?lang=. Each language now has its own page, so the old query-string',
    '# addresses point at the page they used to render.',
    '#',
    '# Spanish is deliberately absent: it still lives at "/", and Netlify carries the',
    '# query string over to the destination, so "/?lang=es" -> "/" would arrive back',
    '# at "/?lang=es" and loop. The canonical tag on "/" consolidates it instead.',
    '/  lang=en  /en/  301!',
    '/  lang=pt  /pt/  301!',
    '',
    '# "/es/" never existed as a page, but it is the obvious guess once /en/ and /pt/ do.',
    '/es/  /  301!',
    '',
  ];

  // Netlify keeps serving the site from its own hostnames alongside the custom
  // domain, and those copies answer 200 with a canonical tag pointing at
  // datagovjourney.com. Google fetches them, believes the canonical, and files
  // every URL as a duplicate — 39 of them, which is most of what the coverage
  // report was reporting. A 301 removes the copy instead of arguing with it.
  //
  // Production only. A deploy preview lives on its own netlify.app hostname
  // too, and redirecting that away would send a reviewer to the live site
  // rather than to the build they are reviewing; previews get the noindex
  // header from renderHeaders() instead.
  if (IS_PRODUCTION_DEPLOY) {
    lines.push(
      '# Netlify\'s own hostnames serve a complete duplicate of the site.',
      'https://dejourney.netlify.app/* https://datagovjourney.com/:splat 301!',
      'https://main--dejourney.netlify.app/* https://datagovjourney.com/:splat 301!',
      ''
    );
  }

  // The directory URL is the canonical one everywhere on this site: it is what
  // the sitemap lists, what every canonical tag says and what every internal
  // link points at. No loop: Netlify resolves "/en/blog/" to the index.html
  // behind it as a file lookup, which does not re-enter the redirect engine.
  lines.push('# Explicit-filename twins of the directory URLs above.');
  for (const route of canonicalRoutes) {
    lines.push(`${route}index.html ${route} 301!`);
  }
  lines.push(
    '',
    '# The contact form posts to the extensionless address, so that is the one',
    '# the page is published at.',
    '/thank-you.html /thank-you 301!',
    '',
    '# Legacy client-rendered article URLs now have their own static pages.'
  );
  for (const article of articles) {
    lines.push(`/${article.lang}/blog/article.html post=${article.slug} ${articlePath(article.lang, article.slug)} 301!`);
  }
  // Ordered ahead of the catch-all below so a legacy link to a since-renamed
  // article reaches the article rather than the index.
  for (const rename of renames) {
    lines.push(`/${rename.lang}/blog/article.html post=${rename.previousSlug} ${rename.target} 301!`);
  }
  for (const lang of LANGUAGES) {
    lines.push(`/${lang}/blog/article.html /${lang}/blog/ 301!`);
  }
  if (renames.length) {
    lines.push('', '# Addresses published articles were renamed away from.');
    for (const rename of renames) {
      lines.push(`/${rename.lang}/blog/${rename.previousSlug}/ ${rename.target} 301!`);
    }
  }
  return `${lines.join('\n')}\n`;
}

/**
 * The `_headers` file, or null when this build should not ship one.
 *
 * Only non-production builds get a file, and its only job is to keep the
 * preview out of the index. Netlify gives every deploy preview and branch
 * deploy a public hostname that serves the whole site, canonical tags included;
 * Google crawls those, trusts the canonical, and records another duplicate of
 * a page it has already seen. X-Robots-Tag stops that at the source, and unlike
 * a robots.txt rule it still lets the crawler fetch the page and read the
 * instruction.
 *
 * The site-wide headers stay in netlify.toml. This file exists only for the
 * one header whose value depends on which deploy is being built, which
 * netlify.toml cannot express.
 */
function renderHeaders() {
  if (IS_PRODUCTION_DEPLOY) return null;
  return `# Generated by scripts/generate-blog-index.mjs for a non-production deploy
# (CONTEXT=${process.env.CONTEXT || 'unset'}). The production build writes no
# _headers file at all, so this can never reach datagovjourney.com.
/*
  X-Robots-Tag: noindex, nofollow
`;
}

/**
 * Writes one single-language homepage per language from the shared master.
 *
 * These files are build output: edit src/home.html, not index.html, en/index.html
 * or pt/index.html, which every deploy overwrites.
 */
async function writeHomePages(articles) {
  const template = await readFile(path.join(projectDirectory, 'src/home.html'), 'utf8');
  const schemaGraph = JSON.parse(await readFile(path.join(projectDirectory, 'src/home-schema.json'), 'utf8'));

  for (const lang of LANGUAGES) {
    const route = HOME_PATH[lang];
    const outputDirectory = path.join(projectDirectory, route === '/' ? '.' : route.slice(1, -1));
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      path.join(outputDirectory, 'index.html'),
      renderHomePage(template, schemaGraph, lang, articles),
      'utf8'
    );
  }
}

/**
 * Writes the two llms.txt files from the same article list as the sitemap.
 *
 * The human-maintained prose at the top lives in src/llms-intro.md; everything
 * below it is generated, so a newly published article shows up without anyone
 * remembering to edit a second file.
 */
async function writeLlmsFiles(articles) {
  const intro = await readFile(path.join(projectDirectory, 'src/llms-intro.md'), 'utf8');
  await writeFile(path.join(projectDirectory, 'llms.txt'), renderLlmsIndex(intro, articles, LANGUAGES), 'utf8');
  await writeFile(path.join(projectDirectory, 'llms-full.txt'), renderLlmsFull(intro, articles, LANGUAGES), 'utf8');
}

/**
 * `assets/styles.css` is a hand-written Tailwind subset, so a class that is not
 * authored there does nothing and reports no error. Fail the build instead of
 * shipping markup whose layout silently does not apply.
 */
async function verifyClassCoverage() {
  const { enforced, advisory, unused } = await checkClassCoverage();

  // Advisory results never stop a deploy, but they should not be silent either:
  // a build log that only ever says "ok" is how the simulators drifted out of
  // coverage in the first place.
  const advisoryTotal = advisory.reduce((total, result) => total + result.missing.length, 0);
  if (advisoryTotal > 0) {
    console.log(`  advisory: ${advisoryTotal} undefined class(es) on simulator pages (not enforced)`);
  }
  if (unused.length > 0) {
    console.log(`  advisory: ${unused.length} unreferenced rule(s) in assets/styles.css`);
  }

  const offenders = enforced.filter((result) => result.missing.length > 0);
  if (offenders.length === 0) return;

  const detail = offenders
    .flatMap((result) => result.missing.map(({ token, line }) => `  ${result.file}:${line}  .${token}`))
    .join('\n');
  throw new Error(
    `Undefined CSS class(es) used in markup:\n${detail}\nAdd the rule to the stylesheet, or list the class in scripts/check-class-coverage.mjs if it is a behavioural hook.`
  );
}

/**
 * Fails the build when a third-party asset is loaded without a pinned version
 * and a matching hash, or a new tab is opened without rel="noopener".
 *
 * Runs last, on the pages that were just written, so it inspects what actually
 * ships rather than whatever happened to be on disk beforehand.
 */
async function verifyAssetIntegrity() {
  const problems = await checkAssetIntegrity();
  if (problems.length === 0) return;

  throw new Error(
    `Third-party asset problems:\n${problems.map((problem) => `  ${problem}`).join('\n')}\n` +
      'Pin the version and record its sha384 in scripts/check-asset-integrity.mjs, or list the URL there as unpinnable with the reason.'
  );
}

async function main() {
  await verifyClassCoverage();

  const articles = await loadArticles();
  const translationMap = buildTranslationMap(articles);
  const renames = collectRenames(articles);
  const categoryPages = collectCategoryPages(articles);
  const categoryHubs = new Set(categoryPages.map((page) => page.key));

  await writeHomePages(articles);
  const confessionWalls = await renderConfessionWalls(projectDirectory);

  const generatedDirectories = new Set();
  for (const article of articles) {
    const outputDirectory = path.join(projectDirectory, article.lang, 'blog', article.slug);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      path.join(outputDirectory, 'index.html'),
      renderArticlePage(article, translationMap.get(article.translationKey), articles, categoryHubs),
      'utf8'
    );
    generatedDirectories.add(`${article.lang}/${article.slug}`);
  }

  // The hubs live under <lang>/blog/category/, which is inside the directory the
  // pruning pass below sweeps, so the container is registered as generated and
  // its own contents are pruned separately. A category that drops below
  // CATEGORY_PAGE_MINIMUM — or is renamed — therefore stops being published
  // rather than lingering as an orphan the sitemap no longer lists.
  for (const lang of LANGUAGES) {
    const categoryDirectory = path.join(projectDirectory, lang, 'blog', 'category');
    const localized = categoryPages.filter((page) => page.lang === lang);
    generatedDirectories.add(`${lang}/category`);

    if (!localized.length) {
      await rm(categoryDirectory, { recursive: true, force: true });
      continue;
    }
    await mkdir(categoryDirectory, { recursive: true });
    for (const page of localized) {
      await mkdir(path.join(categoryDirectory, page.key), { recursive: true });
      await writeFile(
        path.join(categoryDirectory, page.key, 'index.html'),
        renderCategoryPage(page, categoryPages),
        'utf8'
      );
    }
    const published = new Set(localized.map((page) => page.key));
    for (const entry of await readdir(categoryDirectory, { withFileTypes: true })) {
      if (entry.isDirectory() && !published.has(entry.name)) {
        await rm(path.join(categoryDirectory, entry.name), { recursive: true, force: true });
      }
    }
  }

  // Remove article directories whose Markdown source no longer exists.
  const removed = [];
  for (const lang of LANGUAGES) {
    const blogDirectory = path.join(projectDirectory, lang, 'blog');
    for (const entry of await readdir(blogDirectory, { withFileTypes: true })) {
      if (entry.isDirectory() && !generatedDirectories.has(`${lang}/${entry.name}`)) {
        removed.push({ lang, slug: entry.name });
        await rm(path.join(blogDirectory, entry.name), { recursive: true, force: true });
      }
    }
  }

  await updateBlogIndexes(articles, categoryPages);
  await writeSearchIndexes(articles);
  await writeLlmsFiles(articles);

  // Every directory-style URL the site publishes, which is also every URL that
  // has an index.html twin for renderRedirects to collapse.
  const canonicalRoutes = [
    ...STATIC_ROUTES.map((route) => route.url),
    ...categoryPages.map((page) => page.url),
    ...articles.map((article) => articlePath(article.lang, article.slug)),
  ];

  await writeFile(
    path.join(projectDirectory, 'sitemap.xml'),
    renderSitemap(articles, translationMap, categoryPages),
    'utf8'
  );
  await writeFile(
    path.join(projectDirectory, '_redirects'),
    renderRedirects(articles, renames, canonicalRoutes),
    'utf8'
  );

  const headers = renderHeaders();
  if (headers) await writeFile(path.join(projectDirectory, '_headers'), headers, 'utf8');
  // A previous local run may have left one behind; production must never ship it.
  else await rm(path.join(projectDirectory, '_headers'), { force: true });

  await verifyAssetIntegrity();

  // This is the only build that can see the old address: the directory is gone
  // afterwards, so an unannounced rename would never be reported again.
  const redirected = new Set(renames.map((rename) => `${rename.lang}/${rename.previousSlug}`));
  const unhandled = removed.filter((entry) => !redirected.has(`${entry.lang}/${entry.slug}`));
  if (unhandled.length) {
    console.warn(
      `Warning: removed ${unhandled.length} article URL(s) that nothing redirects away from:\n${unhandled
        .map((entry) => `  ${articlePath(entry.lang, entry.slug)}`)
        .join('\n')}\nIf an article was renamed, add its old slug to the "Previous URLs" field so existing links keep working.`
    );
  }

  console.log(
    `Generated ${LANGUAGES.length} homepages, ${confessionWalls} confession walls, ` +
      `${articles.length} static article pages, ${categoryPages.length} category pages, sitemap, and redirects.`
  );
}

await main();
