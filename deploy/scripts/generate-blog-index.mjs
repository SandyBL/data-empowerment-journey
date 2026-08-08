import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseFrontMatter, renderMarkdown, readingTimeMinutes, escapeHtml } from './lib/markdown.mjs';

const SITE_ORIGIN = 'https://datagovjourney.com';
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
    relatedTitle: 'Keep reading',
  },
  es: {
    blogTitle: 'Journal / Ideas',
    allArticles: 'Todos los artículos',
    home: 'Inicio',
    toc: 'En esta página',
    minRead: 'min de lectura',
    by: 'Por',
    about: 'Sobre la autora',
    aboutText:
      'Consultora de gobierno de datos y profesional certificada CDMP que ayuda a las organizaciones a alinear personas, procesos y tecnología en torno a datos confiables.',
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
    relatedTitle: 'Seguir leyendo',
  },
  pt: {
    blogTitle: 'Journal / Ideias',
    allArticles: 'Todos os artigos',
    home: 'Início',
    toc: 'Nesta página',
    minRead: 'min de leitura',
    by: 'Por',
    about: 'Sobre a autora',
    aboutText:
      'Consultora de governança de dados e profissional certificada CDMP que ajuda organizações a alinhar pessoas, processos e tecnologia em torno de dados confiáveis.',
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
    relatedTitle: 'Continue lendo',
  },
};

/**
 * Non-article URLs that belong in the sitemap.
 *
 * The homepage serves all three languages from a single URL, so only "/" is
 * listed; the ?lang= variants are declared as hreflang alternates rather than
 * as their own entries, which keeps one canonical homepage in the index.
 */
const STATIC_ROUTES = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'weekly',
    alternates: [
      ...LANGUAGES.map((lang) => ({ hreflang: lang, url: `/?lang=${lang}` })),
      { hreflang: 'x-default', url: '/' },
    ],
  },
  ...['blog', 'confession-wall'].flatMap((section) =>
    LANGUAGES.map((lang) => ({
      url: `/${lang}/${section}/`,
      priority: section === 'blog' ? '0.8' : '0.7',
      changefreq: 'weekly',
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

const normalizeSearchText = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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
      articles.push({
        lang,
        slug,
        file,
        title: attributes.title,
        summary: attributes.summary || '',
        category: attributes.category || '',
        author: attributes.author || 'Sandy Bradbury',
        date: attributes.date,
        translationKey: attributes.translation_key || slug,
        readingTime: readingTimeMinutes(body),
        bodyHtml: html,
        headings,
        searchText: normalizeSearchText(`${attributes.title} ${attributes.category} ${attributes.summary} ${body}`),
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

function renderRelated(article, articles, labels) {
  const related = articles
    .filter((candidate) => candidate.lang === article.lang && candidate.slug !== article.slug)
    .sort((first, second) => {
      const sameCategory = Number(second.category === article.category) - Number(first.category === article.category);
      return sameCategory || second.date.localeCompare(first.date);
    })
    .slice(0, 3);
  if (!related.length) return '';
  const items = related
    .map(
      (item) =>
        `<li><a href="${articlePath(item.lang, item.slug)}"><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.title)}</strong></a></li>`
    )
    .join('');
  return `<nav class="related-articles blog-shell" aria-label="${labels.relatedTitle}"><h2>${labels.relatedTitle}</h2><ul>${items}</ul></nav>`;
}

function renderArticlePage(article, translations, articles) {
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

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description,
        datePublished: article.date,
        dateModified: article.date,
        inLanguage: HTML_LANG[article.lang],
        articleSection: article.category,
        author: { '@type': 'Person', name: article.author },
        publisher: {
          '@type': 'Organization',
          name: 'Data Governance Journey',
          logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/assets/images/dg-logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        url: canonical,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: labels.breadcrumbHome, item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: labels.breadcrumbBlog, item: `${SITE_ORIGIN}/${article.lang}/blog/` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
        ],
      },
    ],
  };

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
  <meta property="og:image" content="${SITE_ORIGIN}/assets/images/dg-logo.png">
  <meta property="article:published_time" content="${article.date}">
  <meta property="article:author" content="${escapeHtml(article.author)}">
  <meta property="article:section" content="${escapeHtml(article.category)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.title)} | Data Governance Journey">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}/assets/images/dg-logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="/assets/images/dg-logo.png">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site-brand.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-lang="${article.lang}" class="article-ready">
  <a class="skip-link" href="#article">${labels.skip}</a>
  <header class="blog-header"><nav class="blog-nav blog-shell" aria-label="Primary navigation"><a class="blog-brand" href="/?lang=${article.lang}"><img src="/assets/images/dg-logo.png" alt="Data Governance Journey" width="40" height="40"><span class="blog-wordmark">Data Governance Journey</span></a><a class="blog-nav-center" href="/${article.lang}/blog/">${labels.blogTitle}</a><div class="blog-nav-actions"><a class="home-link" href="/${article.lang}/blog/">${labels.allArticles}</a><div class="language-nav" aria-label="Language">${languageNav}</div></div></nav></header>
  <main id="article">
    <header class="article-hero blog-shell">
      <span class="blog-kicker">${escapeHtml(article.category)}</span>
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
        <aside class="author-card" aria-label="${labels.about}"><img src="/icone%20foto%20limpo.png" alt="Sandy Bradbury" width="96" height="96" loading="lazy"><div><small>${labels.about}</small><h2>Sandy Bradbury</h2><p>${labels.aboutText}</p></div></aside>
      </div>
    </div>
    ${renderRelated(article, articles, labels)}
    <aside class="tools-cta article-cta blog-shell"><div><small>${labels.ctaKicker}</small><h2>${labels.ctaTitle}</h2></div><div class="cta-actions"><a class="cta-button" href="/?lang=${article.lang}#recursos">${labels.ctaTools}</a><a class="cta-button cta-button-secondary" href="/?lang=${article.lang}#scorecard">${labels.ctaScorecard}</a></div></aside>
  </main>
  <footer class="blog-footer blog-shell">© ${new Date().getUTCFullYear()} Data Governance Journey</footer>
</body>
</html>
`;
}

function renderArchiveCard(article, { hero = false } = {}) {
  const href = articlePath(article.lang, article.slug);
  const attributes = [
    `data-post-path="/content/blog/${article.lang}/${article.file}"`,
    `data-title="${escapeHtml(article.title)}"`,
    `data-category="${escapeHtml(article.category)}"`,
    `data-date="${article.date}"`,
    `data-search="${escapeHtml(article.searchText.slice(0, 4000))}"`,
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

/** Renders the archive listing into each blog index so crawlers see real links. */
async function updateBlogIndexes(articles) {
  for (const lang of LANGUAGES) {
    const indexPath = path.join(projectDirectory, lang, 'blog', 'index.html');
    const localized = articles
      .filter((article) => article.lang === lang)
      .sort((first, second) => second.date.localeCompare(first.date));
    const [hero, ...rest] = localized;

    let source = await readFile(indexPath, 'utf8');
    source = replaceBetweenMarkers(source, 'BLOG_HERO', renderArchiveCard(hero, { hero: true }), indexPath);
    source = replaceBetweenMarkers(
      source,
      'BLOG_ARCHIVE',
      rest.map((article) => renderArchiveCard(article)).join(''),
      indexPath
    );
    await writeFile(indexPath, source, 'utf8');
  }
}

function renderSitemap(articles, translationMap) {
  const entries = [];

  const escapeUrl = (url) => `${SITE_ORIGIN}${url}`.replace(/&/g, '&amp;');

  for (const route of STATIC_ROUTES) {
    entries.push(
      [
        '  <url>',
        `    <loc>${escapeUrl(route.url)}</loc>`,
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
        `    <lastmod>${article.date}</lastmod>`,
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

/** Rewrites the legacy query-string article URLs to their static equivalents. */
function renderRedirects(articles) {
  const lines = [
    '# Canonical host: force HTTPS on the apex domain.',
    'http://datagovjourney.com/* https://datagovjourney.com/:splat 301!',
    '',
    '# Legacy client-rendered article URLs now have their own static pages.',
  ];
  for (const article of articles) {
    lines.push(`/${article.lang}/blog/article.html post=${article.slug} ${articlePath(article.lang, article.slug)} 301!`);
  }
  for (const lang of LANGUAGES) {
    lines.push(`/${lang}/blog/article.html /${lang}/blog/ 301!`);
  }
  return `${lines.join('\n')}\n`;
}

async function main() {
  const articles = await loadArticles();
  const translationMap = buildTranslationMap(articles);

  const generatedDirectories = new Set();
  for (const article of articles) {
    const outputDirectory = path.join(projectDirectory, article.lang, 'blog', article.slug);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      path.join(outputDirectory, 'index.html'),
      renderArticlePage(article, translationMap.get(article.translationKey), articles),
      'utf8'
    );
    generatedDirectories.add(`${article.lang}/${article.slug}`);
  }

  // Remove article directories whose Markdown source no longer exists.
  for (const lang of LANGUAGES) {
    const blogDirectory = path.join(projectDirectory, lang, 'blog');
    for (const entry of await readdir(blogDirectory, { withFileTypes: true })) {
      if (entry.isDirectory() && !generatedDirectories.has(`${lang}/${entry.name}`)) {
        await rm(path.join(blogDirectory, entry.name), { recursive: true, force: true });
      }
    }
  }

  await updateBlogIndexes(articles);
  await writeFile(path.join(projectDirectory, 'sitemap.xml'), renderSitemap(articles, translationMap), 'utf8');
  await writeFile(path.join(projectDirectory, '_redirects'), renderRedirects(articles), 'utf8');

  console.log(`Generated ${articles.length} static article pages, sitemap, and redirects.`);
}

await main();
