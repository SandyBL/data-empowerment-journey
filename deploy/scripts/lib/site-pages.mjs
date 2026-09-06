/**
 * The standalone pages: /about/, /consulting/, /advisory-sessions/,
 * /workshops/, /faq/, and the four resource pages that used to be homepage
 * fragments.
 *
 * Content lives in content/pages/<lang>/<slug>.md so a page can be edited
 * without touching a template, and the interactive blocks — the calculator, the
 * template library, the playbook cards, the workshop offer — are injected into
 * the Markdown at build time from src/partials/. That keeps one copy of each
 * block: the homepage teaser links to the page, the page holds the real thing.
 *
 * Injection uses a token on its own line (`{{CALCULATOR}}`). The Markdown is
 * split on those lines rather than having the token substituted after
 * rendering, because these blocks are full-width sections and the prose around
 * them is a narrow measure — they cannot be nested inside the same wrapper.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { PORTRAIT, SITE_ORIGIN, imageCdn } from './brand.mjs';
import { escapeHtml, parseFrontMatter, renderMarkdown } from './markdown.mjs';
import { localizeLinks, stripOtherLanguages } from './home-pages.mjs';
import {
  HOME_PATH,
  LANGUAGES,
  NAV,
  breadcrumbSchema,
  pagePath,
  renderBreadcrumb,
  renderPage,
} from './page-shell.mjs';
import { faqSchema, renderFaqSection } from './faq.mjs';
import { renderNewsletterForm } from './newsletter.mjs';
import { renderBoardSummary } from './board-summary.mjs';

/**
 * Which src/partials file each token pulls in.
 *
 * NEWSLETTER, CERTIFICATIONS, PORTRAIT and PUBLIC_BOARDS are absent
 * deliberately: they are rendered from code rather than lifted from the
 * homepage, and are handled below.
 */
const PARTIAL_FILES = {
  CALCULATOR: 'bad-data-calculator.html',
  TEMPLATES: 'template-library.html',
  PLAYBOOKS: 'playbook-cards.html',
  SIMULATOR_OFFER: 'simulator-offer.html',
};

/** A token alone on a line, which is how a partial is placed in the Markdown. */
const TOKEN_LINE = /^\{\{([A-Z_]+)\}\}$/;

/** Pages whose Markdown embeds homepage markup, and therefore its stylesheet. */
const EMBEDS_HOME_MARKUP = new Set(Object.keys(PARTIAL_FILES));

const SCHEMA_KINDS = new Set(['page', 'profile', 'service', 'collection', 'faq']);

const LABELS = {
  en: {
    home: 'Home',
    updated: 'Last updated',
    readMore: 'Related reading',
    credentials: 'Certifications',
    cdmpAssociate: 'CDMP Associate — DAMA International',
    cdmpFundamentals: 'CDMP Data Management Fundamentals — DAMA International',
    portraitAlt: 'Sandy Bradbury, data governance consultant',
  },
  es: {
    home: 'Inicio',
    updated: 'Última actualización',
    readMore: 'Lecturas relacionadas',
    credentials: 'Certificaciones',
    cdmpAssociate: 'CDMP Associate — DAMA International',
    cdmpFundamentals: 'CDMP Data Management Fundamentals — DAMA International',
    portraitAlt: 'Sandy Bradbury, consultora de gobierno de datos',
  },
  pt: {
    home: 'Início',
    updated: 'Última atualização',
    readMore: 'Leituras relacionadas',
    credentials: 'Certificações',
    cdmpAssociate: 'CDMP Associate — DAMA International',
    cdmpFundamentals: 'CDMP Data Management Fundamentals — DAMA International',
    portraitAlt: 'Sandy Bradbury, consultora de governança de dados',
  },
};

const DATE_LOCALE = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };

const formatDate = (iso, lang) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(DATE_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** Reads src/partials once, so eight pages in three languages share one read. */
export const loadPartials = async (projectDirectory) => {
  const entries = await Promise.all(
    Object.entries(PARTIAL_FILES).map(async ([token, file]) => [
      token,
      await readFile(path.join(projectDirectory, 'src', 'partials', file), 'utf8'),
    ])
  );
  return Object.fromEntries(entries);
};

export const loadSitePages = async (projectDirectory) => {
  const pages = [];

  for (const lang of LANGUAGES) {
    const directory = path.join(projectDirectory, 'content', 'pages', lang);
    const files = (await readdir(directory)).filter((file) => file.endsWith('.md')).sort();

    for (const file of files) {
      const source = await readFile(path.join(directory, file), 'utf8');
      const { attributes, body } = parseFrontMatter(source);
      const slug = attributes.slug || file.replace(/\.md$/, '');

      for (const required of ['title', 'heading', 'description', 'nav']) {
        if (!attributes[required]) {
          throw new Error(`content/pages/${lang}/${file} is missing "${required}"`);
        }
      }
      if (!NAV[lang][attributes.nav]) {
        throw new Error(
          `content/pages/${lang}/${file} has nav "${attributes.nav}", which is not a key in NAV.${lang}`
        );
      }
      const schemaKind = attributes.schema || 'page';
      if (!SCHEMA_KINDS.has(schemaKind)) {
        throw new Error(
          `content/pages/${lang}/${file} has schema "${schemaKind}"; expected one of ${[...SCHEMA_KINDS].join(', ')}`
        );
      }

      pages.push({
        lang,
        slug,
        // Pages share a slug across languages, so the slug is the translation
        // key. Terms and articles differ; these do not, because the slug is a
        // URL segment chosen for search rather than translated prose.
        translationKey: slug,
        title: attributes.title,
        heading: attributes.heading,
        kicker: attributes.kicker || '',
        deck: attributes.deck || '',
        description: attributes.description,
        nav: attributes.nav,
        schemaKind,
        serviceName: attributes.service_name || '',
        updated: attributes.updated || '',
        showNewsletter: attributes.newsletter === 'true',
        articleKeys: (attributes.related_articles || '')
          .split(',')
          .map((key) => key.trim())
          .filter(Boolean),
        body,
      });
    }
  }

  return pages;
};

/** The two DAMA certification images, as a figure each. */
const renderCertifications = (lang) => {
  const labels = LABELS[lang];
  const figure = (file, caption, width, height) =>
    `<figure class="page-credential"><img src="${imageCdn(
      `/assets/certifications/${file}`,
      480
    )}" alt="${escapeHtml(caption)}" width="${width}" height="${height}" loading="lazy" decoding="async"><figcaption>${escapeHtml(
      caption
    )}</figcaption></figure>`;

  return `    <section class="page-section blog-shell" aria-labelledby="credentials">
      <h2 id="credentials">${escapeHtml(labels.credentials)}</h2>
      <div class="page-credentials">
        ${figure('cdmp-associate-certified.png', labels.cdmpAssociate, 480, 480)}
        ${figure('cdmp-data-management-fundamentals.jpg', labels.cdmpFundamentals, 480, 480)}
      </div>
    </section>`;
};

/**
 * Prepares a homepage block for a standalone page.
 *
 * The blocks arrive with all three languages inline and with hrefs that assume
 * they are on the homepage, so both have to be resolved before they are usable
 * anywhere else.
 */
const prepareInjected = (html, lang) =>
  localizeLinks(stripOtherLanguages(html, lang), lang)
    // `#contact-form-start` is a homepage anchor; from another page it needs the
    // homepage in front of it or it scrolls to nothing.
    .replace(/href="#contact-form-start"/g, `href="${HOME_PATH[lang]}#contact-form-start"`)
    // The maturity scorecard was `#scorecard` on the homepage and is now a page.
    .replace(/href="#scorecard"/g, `href="${pagePath(lang, 'maturity-assessment')}"`);

/** Renders one Markdown chunk as a prose block, or nothing if it is blank. */
const proseBlock = (markdown) => {
  if (!markdown.trim()) return '';
  return `    <div class="page-section blog-shell"><div class="page-prose">
${renderMarkdown(markdown).html}
    </div></div>`;
};

/**
 * Splits the body on token lines and renders the alternating sequence of prose
 * and injected blocks.
 */
const renderBody = (page, partials, boardSummary) => {
  const blocks = [];
  let markdown = [];

  const flush = () => {
    const block = proseBlock(markdown.join('\n'));
    if (block) blocks.push(block);
    markdown = [];
  };

  for (const line of page.body.split('\n')) {
    const token = line.trim().match(TOKEN_LINE);
    if (!token) {
      markdown.push(line);
      continue;
    }
    flush();

    const name = token[1];
    if (name === 'CERTIFICATIONS') {
      blocks.push(renderCertifications(page.lang));
      continue;
    }
    if (name === 'NEWSLETTER') {
      blocks.push(
        `    <div class="blog-shell">${renderNewsletterForm(page.lang, {
          source: `page:${page.slug}`,
          id: `newsletter-${page.slug}`,
        })}</div>`
      );
      continue;
    }
    if (name === 'PUBLIC_BOARDS') {
      blocks.push(renderBoardSummary(boardSummary, page.lang));
      continue;
    }
    if (name === 'FAQ') {
      blocks.push(renderFaqSection(page.lang));
      continue;
    }
    if (name === 'PORTRAIT') {
      blocks.push(
        `    <div class="page-section blog-shell"><figure class="page-credential"><img src="${imageCdn(
          PORTRAIT.url,
          384,
          384
        )}" alt="${escapeHtml(LABELS[page.lang].portraitAlt)}" width="192" height="192" loading="lazy" decoding="async"></figure></div>`
      );
      continue;
    }
    if (!partials[name]) {
      throw new Error(
        `content/pages/${page.lang}/${page.slug}.md uses {{${name}}}, which is not a known block`
      );
    }
    blocks.push(`    <div class="blog-shell">${prepareInjected(partials[name], page.lang)}</div>`);
  }

  flush();
  return blocks.join('\n');
};

/** Which injected blocks a page uses, so the stylesheet can be gated on it. */
const usesHomeMarkup = (page) =>
  page.body
    .split('\n')
    .some((line) => EMBEDS_HOME_MARKUP.has(line.trim().match(TOKEN_LINE)?.[1] ?? ''));

const schemaFor = (page, canonical, steps) => {
  const graph = [
    {
      '@type': page.schemaKind === 'profile' ? 'ProfilePage' : page.schemaKind === 'collection' ? 'CollectionPage' : 'WebPage',
      '@id': canonical,
      url: canonical,
      name: page.heading,
      description: page.description,
      inLanguage: page.lang,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      ...(page.updated ? { dateModified: page.updated } : {}),
      ...(page.schemaKind === 'profile' ? { mainEntity: { '@id': `${SITE_ORIGIN}/#sandy-bradbury` } } : {}),
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
    },
    breadcrumbSchema(canonical, steps),
  ];

  // The profile page is the one page on the site that is *about* the person, so
  // it declares the Person in full rather than referencing the homepage's copy
  // by @id. Same @id, so the two are one entity; a consumer that only ever
  // fetches this page still gets a name, a role and the credentials, which is
  // the difference between a profile and a pointer.
  if (page.schemaKind === 'profile') {
    graph.push({
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#sandy-bradbury`,
      name: 'Sandy Bradbury',
      // The English page, on every language's copy of this node, because the
      // @id is one entity and one entity has one canonical url. The
      // language-specific description stays on the ProfilePage above, where it
      // describes the page rather than the person.
      url: `${SITE_ORIGIN}/en/about/`,
      image: `${SITE_ORIGIN}${PORTRAIT.url}`,
      jobTitle: 'Lead Data Governance Consultant',
      knowsLanguage: ['en', 'es', 'pt'],
      worksFor: { '@id': `${SITE_ORIGIN}/#organization` },
      memberOf: {
        '@type': 'Organization',
        name: 'DAMA International',
        url: 'https://www.dama.org/',
      },
      hasCredential: [
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'Certified Data Management Professional (CDMP) — Associate',
          credentialCategory: 'certification',
          recognizedBy: { '@type': 'Organization', name: 'DAMA International', url: 'https://www.dama.org/' },
        },
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'Data Management Fundamentals',
          credentialCategory: 'certification',
          recognizedBy: { '@type': 'Organization', name: 'DAMA International', url: 'https://www.dama.org/' },
        },
      ],
    });
  }

  if (page.schemaKind === 'faq') {
    graph.push(faqSchema(page.lang, canonical));
  }

  if (page.schemaKind === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: page.serviceName || page.heading,
      description: page.description,
      url: canonical,
      provider: { '@id': `${SITE_ORIGIN}/#organization` },
      // Remote-first consulting, so the audience is not bounded by geography and
      // claiming a single country would be wrong.
      areaServed: 'Worldwide',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: canonical,
      },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
};

export const renderSitePage = (page, pages, { partials, articles, boardSummary }) => {
  const labels = LABELS[page.lang];
  const nav = NAV[page.lang];
  const canonical = `${SITE_ORIGIN}${pagePath(page.lang, page.slug)}`;

  // Every page exists in all three languages, but derive the cluster from what
  // actually loaded rather than assuming it, so a missing file is a missing
  // hreflang and not a link to a 404.
  const siblings = pages.filter((other) => other.translationKey === page.translationKey);
  const alternates = [
    ...siblings.map((sibling) => ({
      hreflang: sibling.lang,
      url: pagePath(sibling.lang, sibling.slug),
    })),
    { hreflang: 'x-default', url: pagePath('en', page.slug) },
  ];

  // Only the languages that actually loaded, so the switcher never offers a flag
  // that leads to a 404.
  const languageHrefs = Object.fromEntries(
    siblings.map((sibling) => [sibling.lang, pagePath(sibling.lang, sibling.slug)])
  );

  const steps = [
    { name: labels.home, item: `${SITE_ORIGIN}${HOME_PATH[page.lang]}` },
    { name: page.heading, item: canonical },
  ];

  const related = page.articleKeys
    .map((key) => articles.find((article) => article.lang === page.lang && article.translationKey === key))
    .filter(Boolean);

  const main = `    <section class="page-hero blog-shell">
      ${renderBreadcrumb(steps, nav.breadcrumb)}
      ${page.kicker ? `<span class="blog-kicker">${escapeHtml(page.kicker)}</span>` : ''}
      <h1>${escapeHtml(page.heading)}</h1>
      ${page.deck ? `<p class="page-deck">${escapeHtml(page.deck)}</p>` : ''}
      ${page.updated ? `<p class="page-meta">${escapeHtml(labels.updated)} ${formatDate(page.updated, page.lang)}</p>` : ''}
    </section>
${renderBody(page, partials, boardSummary)}${
    related.length
      ? `
    <section class="page-related blog-shell" aria-labelledby="page-reading">
      <h2 id="page-reading">${escapeHtml(labels.readMore)}</h2>
      <ul>${related
        .map(
          (article) =>
            `<li><a href="/${page.lang}/blog/${article.slug}/">${escapeHtml(article.title)}<small>${escapeHtml(
              article.category
            )} · ${article.readingTime} ${escapeHtml(nav.minRead)}</small></a></li>`
        )
        .join('')}</ul>
    </section>`
      : ''
  }`;

  return renderPage({
    lang: page.lang,
    canonical,
    title: page.title,
    description: page.description,
    alternates,
    schema: schemaFor(page, canonical, steps),
    main,
    languageHrefs,
    current: page.nav,
    embedsHomeMarkup: usesHomeMarkup(page),
    ogType: page.schemaKind === 'profile' ? 'profile' : 'website',
    // Each block brings its own script and nothing else loads it, so a page
    // without the block never pays for it.
    extraScripts: [
      page.body.includes('{{CALCULATOR}}')
        ? '  <script type="module" src="/assets/js/bad-data-calculator.js"></script>\n'
        : '',
      page.body.includes('{{NEWSLETTER}}')
        ? '  <script type="module" src="/assets/js/newsletter.js"></script>\n'
        : '',
    ].join(''),
  });
};
