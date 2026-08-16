/**
 * Renders the Confession Wall as a static page in each language.
 *
 * The three pages used to be hand-maintained HTML whose every visible string was
 * an empty element waiting for confession-wall.js: no headings, no lead
 * paragraph, and none of the seeded stories existed in the source. A crawler
 * that does not run JavaScript — which is most of the ones behind AI assistants
 * — saw a page with a <title> and nothing else to index or cite.
 *
 * Now the build writes the copy and the seeded stories into the markup, and the
 * script hydrates published submissions on top. Both read the same content
 * module, so the static page and the live page cannot drift.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { content } from '../../assets/js/confession-wall-content.js';
import { LOGO, OG_IMAGE, SITE_ORIGIN, imageCdn } from './brand.mjs';
import { HOME_PATH } from './home-pages.mjs';

const LANGUAGES = ['en', 'es', 'pt'];
const HTML_LANG = { en: 'en', es: 'es', pt: 'pt-BR' };
const OG_LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR' };

const PAGE_METADATA = {
  en: {
    title: 'The Data Governance Confession Wall | Data Governance Journey',
    description:
      'Anonymous data governance confessions, real organizational lessons, and practical expert guidance from Sandy Bradbury.',
    homeAria: 'Data Governance Journey home',
    languageAria: 'Language selection',
    categoriesAria: 'Confession categories',
    closeAria: 'Close',
    breadcrumbHome: 'Home',
    skipLink: 'Skip to main content',
    breadcrumbAria: 'Breadcrumb',
  },
  es: {
    title: 'El Muro de Confesiones de Gobierno de Datos | Data Governance Journey',
    description:
      'Confesiones anónimas de gobierno de datos, lecciones organizacionales reales y orientación práctica de Sandy Bradbury.',
    homeAria: 'Inicio de Data Governance Journey',
    languageAria: 'Selección de idioma',
    categoriesAria: 'Categorías de confesiones',
    closeAria: 'Cerrar',
    breadcrumbHome: 'Inicio',
    skipLink: 'Saltar al contenido principal',
    breadcrumbAria: 'Ruta de navegación',
  },
  pt: {
    title: 'O Mural de Confissões de Governança de Dados | Data Governance Journey',
    description:
      'Confissões anônimas de governança de dados, lições organizacionais reais e orientação prática de Sandy Bradbury.',
    homeAria: 'Início da Data Governance Journey',
    languageAria: 'Seleção de idioma',
    categoriesAria: 'Categorias de confissões',
    closeAria: 'Fechar',
    breadcrumbHome: 'Início',
    skipLink: 'Ir para o conteúdo principal',
    breadcrumbAria: 'Trilha de navegação',
  },
};

const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const wallUrl = (lang) => `${SITE_ORIGIN}/${lang}/confession-wall/`;

/**
 * One seeded story, in the same shape the script builds at runtime.
 *
 * The class names have to match createStoryCard exactly: the script replaces the
 * whole grid once published submissions arrive, and the two renderings must be
 * indistinguishable or the page would visibly change under the reader.
 */
const renderStoryCard = (story, copy) => `
          <article class="confession-card">
            <div class="confession-card__body">
              <div class="confession-card__meta">
                <span class="confession-card__category"><i class="fa-solid fa-tag" aria-hidden="true"></i>${escapeHtml(story.category)}</span>
                <span class="confession-card__date"></span>
              </div>
              <h3>${escapeHtml(story.title)}</h3>
              <p class="confession-card__role">${escapeHtml(story.role)}</p>
              <p class="confession-card__story">${escapeHtml(story.story)}</p>
            </div>
            <div class="confession-card__takeaway">
              <div class="confession-card__takeaway-label"><i class="fa-solid fa-compass" aria-hidden="true"></i><span>${escapeHtml(copy.expertLabel)}</span></div>
              <p>${escapeHtml(story.expertComment)}</p>
            </div>
          </article>`;

/**
 * Describes the page and its seeded stories to structured-data consumers.
 *
 * The stories are marked as CreativeWork rather than DiscussionForumPosting.
 * They read like forum posts, but they are editorial examples the site wrote to
 * illustrate the pattern, and claiming they are user-contributed posts would be
 * a structured-data assertion the page cannot support.
 */
const renderSchema = (lang, copy, metadata) => {
  const canonical = wallUrl(lang);
  const graph = [
    {
      '@type': 'CollectionPage',
      '@id': `${canonical}#page`,
      url: canonical,
      name: `${copy.titleLead} ${copy.titleAccent}`.trim(),
      description: metadata.description,
      inLanguage: HTML_LANG[lang],
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      about: {
        '@type': 'Thing',
        name: 'Data governance',
        sameAs: ['https://en.wikipedia.org/wiki/Data_governance', 'https://www.wikidata.org/wiki/Q5227240'],
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}${OG_IMAGE.url}`,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
      },
      mainEntity: { '@id': `${canonical}#stories` },
    },
    {
      '@type': 'ItemList',
      '@id': `${canonical}#stories`,
      name: copy.sectionTitle,
      description: copy.sectionLead,
      numberOfItems: copy.defaultStories.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: copy.defaultStories.map((story, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          '@id': `${canonical}#story-${index + 1}`,
          name: story.title,
          headline: story.title,
          text: story.story,
          genre: story.category,
          inLanguage: HTML_LANG[lang],
          publisher: { '@id': `${SITE_ORIGIN}/#organization` },
          // The guidance is the reason the story is published at all, so it is
          // exposed as its own reviewed comment rather than buried in the text.
          comment: {
            '@type': 'Comment',
            text: story.expertComment,
            author: { '@id': `${SITE_ORIGIN}/#sandy-bradbury` },
          },
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: metadata.breadcrumbHome, item: `${SITE_ORIGIN}${HOME_PATH[lang]}` },
        { '@type': 'ListItem', position: 2, name: copy.titleAccent, item: canonical },
      ],
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .split('\n')
    .join('\n  ');
};

const renderPage = (lang) => {
  const copy = content[lang];
  const metadata = PAGE_METADATA[lang];
  if (!copy || !metadata) throw new Error(`No Confession Wall content for language "${lang}"`);

  const canonical = wallUrl(lang);
  const home = HOME_PATH[lang];
  const categories = [copy.all, ...copy.categories];

  const alternates = LANGUAGES.map((other) => `  <link rel="alternate" hreflang="${other}" href="${wallUrl(other)}">`)
    .concat(`  <link rel="alternate" hreflang="x-default" href="${wallUrl('en')}">`)
    .join('\n');

  const alternateLocales = LANGUAGES.filter((other) => other !== lang)
    .map((other) => `  <meta property="og:locale:alternate" content="${OG_LOCALE[other]}">`)
    .join('\n');

  const languageNav = LANGUAGES.map((other) => {
    const current = other === lang ? ' aria-current="page"' : '';
    return `          <a href="${wallUrl(other).replace(SITE_ORIGIN, '')}"${current}>${other.toUpperCase()}</a>`;
  }).join('\n');

  const filters = categories
    .map(
      (category, index) =>
        `        <button type="button" class="wall-filter${index === 0 ? ' is-active' : ''}" data-category="${escapeHtml(category)}" aria-pressed="${index === 0 ? 'true' : 'false'}">${escapeHtml(category)}</button>`,
    )
    .join('\n');

  const categoryOptions = copy.categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join('');

  const logo = `<img src="${imageCdn(LOGO.url, 400, 388)}" alt="Data Governance Journey" width="200" height="194" decoding="async">`;

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metadata.title)}</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#003366">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Data Governance Journey">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta property="og:image:width" content="${OG_IMAGE.width}">
  <meta property="og:image:height" content="${OG_IMAGE.height}">
  <meta property="og:image:alt" content="${escapeHtml(OG_IMAGE.alt)}">
  <meta property="og:locale" content="${OG_LOCALE[lang]}">
${alternateLocales}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
  <meta name="twitter:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
  <meta name="twitter:image:alt" content="${escapeHtml(OG_IMAGE.alt)}">
${alternates}
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preload" href="/assets/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="/assets/css/confession-wall.css">
  <link rel="stylesheet" href="/assets/css/site-brand.css">
  <script type="application/ld+json">
  ${renderSchema(lang, copy, metadata)}
  </script>
</head>
<body data-locale="${lang}">
  <a class="skip-link" href="#main-content">${escapeHtml(metadata.skipLink)}</a>
  <header class="wall-header">
    <div class="wall-header__inner">
      <a class="wall-brand" href="${home}" aria-label="${escapeHtml(metadata.homeAria)}">
        ${logo}
        <span class="wall-brand__title">Data Governance Journey</span>
      </a>
      <div class="wall-header__actions">
        <a class="wall-home-link" href="${home}">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          <span>${escapeHtml(copy.home)}</span>
        </a>
        <nav class="wall-language-nav" aria-label="${escapeHtml(metadata.languageAria)}">
${languageNav}
        </nav>
      </div>
    </div>
  </header>

  <main id="main-content" tabindex="-1">
    <nav class="wall-breadcrumb" aria-label="${escapeHtml(metadata.breadcrumbAria)}">
      <ol>
        <li><a href="${home}">${escapeHtml(metadata.breadcrumbHome)}</a></li>
        <li><span aria-current="page">${escapeHtml(copy.titleAccent)}</span></li>
      </ol>
    </nav>
    <section class="wall-hero">
      <div class="wall-hero__inner">
        <div>
          <p class="wall-eyebrow">${escapeHtml(copy.eyebrow)}</p>
          <h1>${escapeHtml(copy.titleLead)} <em>${escapeHtml(copy.titleAccent)}</em></h1>
          <p class="wall-hero__lead">${escapeHtml(copy.lead)}</p>
          <button class="wall-submit-button" type="button" data-open-confession-form>
            <i class="fa-solid fa-pen-nib" aria-hidden="true"></i>
            <span>${escapeHtml(copy.submit)}</span>
          </button>
        </div>
        <aside class="wall-expert-card">
          <div class="wall-expert-card__icon" aria-hidden="true"><i class="fa-solid fa-lightbulb"></i></div>
          <div class="wall-expert-card__caption">
            <strong>${escapeHtml(copy.guidanceTitle)}</strong>
            <span>${escapeHtml(copy.expertCaption)}</span>
          </div>
        </aside>
      </div>
    </section>

    <section class="wall-main" aria-labelledby="wall-section-title">
      <div class="wall-intro">
        <div>
          <h2 id="wall-section-title">${escapeHtml(copy.sectionTitle)}</h2>
          <p>${escapeHtml(copy.sectionLead)}</p>
        </div>
        <span class="wall-count"><i class="fa-solid fa-layer-group" aria-hidden="true"></i><span id="wall-count" role="status">${copy.defaultStories.length} ${escapeHtml(copy.count)}</span></span>
      </div>
      <div class="wall-controls">
        <label class="wall-search" for="wall-search-input">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <span class="visually-hidden">${escapeHtml(copy.search)}</span>
          <input id="wall-search-input" type="search" placeholder="${escapeHtml(copy.search)}">
        </label>
        <div id="wall-filters" class="wall-filters" role="group" aria-label="${escapeHtml(metadata.categoriesAria)}">
${filters}
        </div>
      </div>
      <div id="wall-grid" class="wall-grid">${copy.defaultStories.map((story) => renderStoryCard(story, copy)).join('')}
      </div>
    </section>
  </main>

  <section class="wall-assessment-cta">
    <div class="wall-assessment-cta__inner">
      <div class="wall-assessment-cta__mark" aria-hidden="true"><i class="fa-solid fa-chart-simple"></i></div>
      <div><p>${escapeHtml(copy.assessmentEyebrow)}</p><h2>${escapeHtml(copy.assessmentTitle)}</h2><span>${escapeHtml(copy.assessmentLead)}</span></div>
      <a class="wall-assessment-cta__button" href="${home}#scorecard"><span>${escapeHtml(copy.assessmentButton)}</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
    </div>
  </section>

  <footer class="wall-footer">
    <div class="wall-footer__inner">
      <div class="wall-footer__brand">
        ${logo}
        <div><strong>Data Governance Journey</strong><span id="footer-copy">${escapeHtml(copy.footer)}</span></div>
      </div>
      <p class="wall-footer__copy">&copy; ${new Date().getUTCFullYear()} Data Governance Journey. <span id="footer-rights">${escapeHtml(copy.copyright)}</span></p>
    </div>
  </footer>

  <div id="submission-modal" class="wall-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
    <div class="wall-modal__card">
      <div class="wall-modal__header">
        <div><h2 id="modal-title">${escapeHtml(copy.modalTitle)}</h2><p id="modal-lead">${escapeHtml(copy.modalLead)}</p></div>
        <button class="wall-modal__close" type="button" data-close-confession-form aria-label="${escapeHtml(metadata.closeAria)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <form id="confession-form" class="wall-form">
        <div class="wall-form__row">
          <div class="wall-field"><label for="confession-role">${escapeHtml(copy.roleLabel)}</label><input id="confession-role" name="role" type="text" maxlength="160" placeholder="${escapeHtml(copy.rolePlaceholder)}"></div>
          <div class="wall-field"><label for="confession-category">${escapeHtml(copy.categoryLabel)}</label><select id="confession-category" name="category" required>${categoryOptions}</select></div>
        </div>
        <div class="wall-field"><label for="confession-title">${escapeHtml(copy.titleLabel)}</label><input id="confession-title" name="title" type="text" maxlength="180" placeholder="${escapeHtml(copy.titlePlaceholder)}" required></div>
        <div class="wall-field"><label for="confession-story">${escapeHtml(copy.storyLabel)}</label><textarea id="confession-story" name="story" minlength="20" maxlength="5000" placeholder="${escapeHtml(copy.storyPlaceholder)}" required></textarea></div>
        <p class="wall-form__privacy"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span id="privacy-copy">${escapeHtml(copy.privacy)}</span></p>
        <p id="confession-form-status" class="wall-form__status" role="alert"></p>
        <div class="wall-form__actions">
          <button id="confession-form-cancel" class="wall-secondary-button" type="button" data-close-confession-form>${escapeHtml(copy.cancel)}</button>
          <button id="confession-form-submit" class="wall-primary-button" type="submit">${escapeHtml(copy.submitForm)}</button>
        </div>
      </form>
    </div>
  </div>
  <div id="wall-toast" class="wall-toast" role="status" aria-live="polite"></div>
  <script type="module" src="/assets/js/confession-wall.js"></script>
  <script src="/assets/js/web-vitals.js" defer></script>
</body>
</html>
`;
};

/** Writes {lang}/confession-wall/index.html for every language. */
export const renderConfessionWalls = async (projectDirectory) => {
  for (const lang of LANGUAGES) {
    const directory = path.join(projectDirectory, lang, 'confession-wall');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), renderPage(lang), 'utf8');
  }
  return LANGUAGES.length;
};
