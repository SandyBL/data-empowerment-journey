/**
 * The glossary: one hub per language, plus one page per term.
 *
 * A glossary is the cheapest thing a site like this can own. Every term is a
 * question somebody types into a search box in the exact words the page is
 * titled with — "what is a data steward", "data quality dimensions", "what does
 * DMBOK stand for" — and a definition is a complete answer to it, which is what
 * makes a term page satisfy a query that a 2,000-word article only mentions in
 * passing. It is also the internal-linking backbone: a term links to the
 * articles that use it, and the articles link back, so a reader who arrived for
 * one definition has somewhere to go and a crawler has a route into the archive
 * that does not run through the blog index.
 *
 * Terms live in content/glossary/<lang>/<slug>.md, one file per term per
 * language, sharing a slug so the hreflang cluster is the filename. A term that
 * exists in one language and not another publishes anyway and declares only the
 * languages it has: a cluster that promises a translation which 404s is worse
 * than a smaller cluster.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFrontMatter, renderMarkdown, escapeHtml } from './markdown.mjs';
import { SITE_ORIGIN } from './brand.mjs';
import {
  HOME_PATH,
  HTML_LANG,
  LANGUAGES,
  NAV,
  breadcrumbSchema,
  pagePath,
  renderBreadcrumb,
  renderPage,
} from './page-shell.mjs';

/** The sections the hub groups terms under, in the order they are shown. */
const GROUPS = [
  'foundations',
  'roles',
  'metadata',
  'quality',
  'literacy',
  'maturity',
  'ai',
  'architecture',
];

const GROUP_LABELS = {
  foundations: {
    en: 'Foundations',
    es: 'Fundamentos',
    pt: 'Fundamentos',
  },
  roles: {
    en: 'Roles and accountability',
    es: 'Roles y responsabilidades',
    pt: 'Papéis e responsabilidades',
  },
  metadata: {
    en: 'Metadata and catalog',
    es: 'Metadatos y catálogo',
    pt: 'Metadados e catálogo',
  },
  quality: {
    en: 'Data quality',
    es: 'Calidad de datos',
    pt: 'Qualidade de dados',
  },
  literacy: {
    en: 'Literacy and culture',
    es: 'Alfabetización y cultura',
    pt: 'Alfabetização e cultura',
  },
  maturity: {
    en: 'Maturity and measurement',
    es: 'Madurez y medición',
    pt: 'Maturidade e medição',
  },
  ai: {
    en: 'AI, privacy and risk',
    es: 'IA, privacidad y riesgo',
    pt: 'IA, privacidade e risco',
  },
  architecture: {
    en: 'Architecture and data products',
    es: 'Arquitectura y productos de datos',
    pt: 'Arquitetura e produtos de dados',
  },
};

const COPY = {
  en: {
    kicker: 'Glossary',
    title: 'Data governance glossary',
    metaTitle: 'Data Governance Glossary | Data Governance Journey',
    metaDescription:
      'Plain-language definitions of the data governance, data quality, data literacy, and AI governance terms that come up in real programs — what each one means, how it is used, and where it goes wrong.',
    lead: 'Every term a data governance conversation runs into, defined in plain language: what it means, how it is actually used, and the mistake people make with it. Written for the person who has to explain it to a room, not for a certification exam.',
    count: (total) => `${total} ${total === 1 ? 'term' : 'terms'}`,
    alsoKnown: 'Also called',
    inThisSection: 'In this section',
    related: 'Related terms',
    readMore: 'Read more on this',
    backToGlossary: 'All terms',
    termMetaTitle: (term) => `What is ${term}? | Data Governance Journey`,
    definition: 'Definition',
    jumpTo: 'Jump to a section',
    onePage: 'This page defines one term. The glossary index has the rest.',
  },
  es: {
    kicker: 'Glosario',
    title: 'Glosario de gobierno de datos',
    metaTitle: 'Glosario de Gobierno de Datos | Data Governance Journey',
    metaDescription:
      'Definiciones claras de los términos de gobierno de datos, calidad de datos, alfabetización de datos y gobierno de la IA que aparecen en programas reales: qué significa cada uno, cómo se usa y dónde se malinterpreta.',
    lead: 'Todos los términos con los que se tropieza una conversación de gobierno de datos, definidos en lenguaje claro: qué significan, cómo se usan de verdad y el error que la gente comete con ellos. Escrito para quien tiene que explicarlo en una reunión, no para aprobar un examen de certificación.',
    count: (total) => `${total} ${total === 1 ? 'término' : 'términos'}`,
    alsoKnown: 'También llamado',
    inThisSection: 'En esta sección',
    related: 'Términos relacionados',
    readMore: 'Leer más sobre esto',
    backToGlossary: 'Todos los términos',
    termMetaTitle: (term) => `¿Qué es ${term}? | Data Governance Journey`,
    definition: 'Definición',
    jumpTo: 'Ir a una sección',
    onePage: 'Esta página define un término. El índice del glosario tiene el resto.',
  },
  pt: {
    kicker: 'Glossário',
    title: 'Glossário de governança de dados',
    metaTitle: 'Glossário de Governança de Dados | Data Governance Journey',
    metaDescription:
      'Definições claras dos termos de governança de dados, qualidade de dados, alfabetização de dados e governança de IA que aparecem em programas reais: o que cada um significa, como é usado e onde é mal interpretado.',
    lead: 'Todos os termos em que uma conversa de governança de dados tropeça, definidos em linguagem clara: o que significam, como são usados de verdade e o erro que as pessoas cometem com eles. Escrito para quem precisa explicar isso numa reunião, não para passar em uma prova de certificação.',
    count: (total) => `${total} ${total === 1 ? 'termo' : 'termos'}`,
    alsoKnown: 'Também chamado de',
    inThisSection: 'Nesta seção',
    related: 'Termos relacionados',
    readMore: 'Leia mais sobre isso',
    backToGlossary: 'Todos os termos',
    termMetaTitle: (term) => `O que é ${term}? | Data Governance Journey`,
    definition: 'Definição',
    jumpTo: 'Ir para uma seção',
    onePage: 'Esta página define um termo. O índice do glossário tem o resto.',
  },
};

export const glossaryHubPath = (lang) => pagePath(lang, 'glossary');
export const glossaryTermPath = (lang, slug) => `/${lang}/glossary/${slug}/`;

const splitList = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * Loads every term file. Fails the build on a missing field or an unknown group
 * rather than publishing a page with a blank heading or a term that silently
 * disappears from the hub because its group name was misspelled.
 */
export async function loadGlossary(projectDirectory) {
  const root = path.join(projectDirectory, 'content/glossary');
  const terms = [];

  for (const lang of LANGUAGES) {
    const directory = path.join(root, lang);
    const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith('.md')).sort();
    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      const source = await readFile(path.join(directory, file), 'utf8');
      const { attributes, body } = parseFrontMatter(source);
      const where = `content/glossary/${lang}/${file}`;
      if (!attributes.term) throw new Error(`Missing "term" in ${where}`);
      if (!attributes.short) throw new Error(`Missing "short" in ${where}`);
      if (!GROUPS.includes(attributes.group)) {
        throw new Error(
          `Unknown group "${attributes.group}" in ${where}. Use one of: ${GROUPS.join(', ')}`
        );
      }
      const { html } = renderMarkdown(body);
      terms.push({
        lang,
        slug,
        file,
        term: attributes.term,
        short: attributes.short,
        group: attributes.group,
        also: splitList(attributes.also),
        related: splitList(attributes.related),
        // A translation key, not a slug: the article slugs differ per language
        // (the Spanish DMBOK piece is "que-es-la-gobernanza-de-datos-..."), so a
        // slug here would resolve in English and silently drop the link in the
        // other two.
        articleKey: attributes.article || '',
        updated: attributes.updated || attributes.date || '',
        body: body.trim(),
        bodyHtml: html,
      });
    }
  }

  return terms;
}

/** slug -> { lang: term }, which is also the hreflang cluster for that slug. */
export const glossaryTranslations = (terms) => {
  const map = new Map();
  for (const term of terms) {
    if (!map.has(term.slug)) map.set(term.slug, {});
    map.get(term.slug)[term.lang] = term;
  }
  return map;
};

const alternatesFor = (slug, translations) => {
  const cluster = translations.get(slug) || {};
  const available = LANGUAGES.filter((lang) => cluster[lang]);
  const fallback = cluster.en ? 'en' : available[0];
  return [
    ...available.map((lang) => ({ hreflang: lang, url: glossaryTermPath(lang, slug) })),
    { hreflang: 'x-default', url: glossaryTermPath(fallback, slug) },
  ];
};

/**
 * Where the language switcher points from a term page.
 *
 * A term that has no counterpart in a language falls back to that language's
 * hub rather than being dropped, because the hub is a useful place to land and
 * every term has one.
 */
const termLanguageHrefs = (slug, translations) => {
  const cluster = translations.get(slug) || {};
  return Object.fromEntries(
    LANGUAGES.map((other) => [other, cluster[other] ? glossaryTermPath(other, slug) : glossaryHubPath(other)])
  );
};

const hubLanguageHrefs = () => Object.fromEntries(LANGUAGES.map((other) => [other, glossaryHubPath(other)]));

/**
 * The hub: every term in the language, grouped, with its one-line definition
 * visible.
 *
 * The definitions are on the page rather than hidden behind the links because a
 * hub whose entire content is a list of anchor texts is a doorway page. With them
 * the hub is itself a useful reference — and it is the page most likely to be
 * bookmarked and linked to.
 */
export function renderGlossaryHub(lang, terms, articles) {
  const copy = COPY[lang];
  const nav = NAV[lang];
  const localized = terms
    .filter((term) => term.lang === lang)
    .sort((first, second) => first.term.localeCompare(second.term, lang));
  const canonical = `${SITE_ORIGIN}${glossaryHubPath(lang)}`;

  const grouped = GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group][lang],
    terms: localized.filter((term) => term.group === group),
  })).filter((section) => section.terms.length);

  const jumpLinks = grouped
    .map((section) => `<a href="#${section.group}">${escapeHtml(section.label)}</a>`)
    .join('');

  const sections = grouped
    .map(
      (section) => `      <section class="glossary-group" id="${section.group}" aria-labelledby="${section.group}-heading">
        <div class="glossary-group__head">
          <h2 id="${section.group}-heading">${escapeHtml(section.label)}</h2>
          <span>${copy.count(section.terms.length)}</span>
        </div>
        <dl class="glossary-list">${section.terms
          .map(
            (term) =>
              `<div class="glossary-entry"><dt><a href="${glossaryTermPath(lang, term.slug)}">${escapeHtml(
                term.term
              )}</a></dt><dd>${escapeHtml(term.short)}</dd></div>`
          )
          .join('')}</dl>
      </section>`
    )
    .join('\n');

  const breadcrumb = [
    { name: nav.home, item: `${SITE_ORIGIN}${HOME_PATH[lang]}` },
    { name: copy.kicker, item: canonical },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollectionPage', 'DefinedTermSet'],
        '@id': `${canonical}#glossary`,
        url: canonical,
        name: copy.title,
        description: copy.metaDescription,
        inLanguage: HTML_LANG[lang],
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        hasDefinedTerm: localized.map((term) => ({ '@id': `${SITE_ORIGIN}${glossaryTermPath(lang, term.slug)}#term` })),
      },
      breadcrumbSchema(canonical, breadcrumb),
    ],
  };

  const relatedReading = articles
    .filter((article) => article.lang === lang)
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 3);

  const main = `    <section class="page-hero blog-shell">
      ${renderBreadcrumb(breadcrumb, nav.breadcrumb)}
      <span class="blog-kicker">${escapeHtml(copy.kicker)}</span>
      <h1>${escapeHtml(copy.title)}</h1>
      <p class="page-deck">${escapeHtml(copy.lead)}</p>
      <p class="page-meta">${copy.count(localized.length)}</p>
    </section>
    <nav class="glossary-jump blog-shell" aria-label="${escapeHtml(copy.jumpTo)}"><span>${escapeHtml(
      copy.jumpTo
    )}</span><div>${jumpLinks}</div></nav>
    <div class="blog-shell">
${sections}
    </div>
    ${
      relatedReading.length
        ? `<section class="page-related blog-shell" aria-labelledby="glossary-reading">
      <h2 id="glossary-reading">${escapeHtml(nav.blog)}</h2>
      <ul>${relatedReading
        .map(
          (article) =>
            `<li><a href="/${lang}/blog/${article.slug}/"><strong>${escapeHtml(
              article.title
            )}</strong><span>${escapeHtml(article.summary)}</span></a></li>`
        )
        .join('')}</ul>
    </section>`
        : ''
    }`;

  return renderPage({
    lang,
    canonical,
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: [
      ...LANGUAGES.map((other) => ({ hreflang: other, url: glossaryHubPath(other) })),
      { hreflang: 'x-default', url: glossaryHubPath('en') },
    ],
    schema,
    main,
    languageHrefs: hubLanguageHrefs(),
    current: 'glossary',
    bodyClass: 'glossary-page',
  });
}

/**
 * One term. The `<dfn>` is what marks the defined phrase to assistive tech.
 *
 * `articles` is the full article list; the front matter names an article by its
 * translation key, so the link resolves to the reader's own language.
 */
export function renderGlossaryTerm(term, terms, translations, articles) {
  const { lang } = term;
  const copy = COPY[lang];
  const nav = NAV[lang];
  const canonical = `${SITE_ORIGIN}${glossaryTermPath(lang, term.slug)}`;
  const bySlug = new Map(terms.filter((entry) => entry.lang === lang).map((entry) => [entry.slug, entry]));

  const related = term.related.map((slug) => bySlug.get(slug)).filter(Boolean);
  const article = articles.find(
    (entry) => entry.lang === lang && entry.translationKey === term.articleKey
  );

  const breadcrumb = [
    { name: nav.home, item: `${SITE_ORIGIN}${HOME_PATH[lang]}` },
    { name: copy.kicker, item: `${SITE_ORIGIN}${glossaryHubPath(lang)}` },
    { name: term.term, item: canonical },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${canonical}#term`,
        name: term.term,
        description: term.short,
        inDefinedTermSet: { '@id': `${SITE_ORIGIN}${glossaryHubPath(lang)}#glossary` },
        url: canonical,
        ...(term.also.length ? { alternateName: term.also } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#page`,
        url: canonical,
        name: copy.termMetaTitle(term.term),
        description: term.short,
        inLanguage: HTML_LANG[lang],
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        mainEntity: { '@id': `${canonical}#term` },
        ...(term.updated ? { dateModified: term.updated } : {}),
      },
      breadcrumbSchema(canonical, breadcrumb),
    ],
  };

  const main = `    <article class="term blog-shell">
      <header class="page-hero">
        ${renderBreadcrumb(breadcrumb, nav.breadcrumb)}
        <span class="blog-kicker">${escapeHtml(copy.kicker)}</span>
        <h1><dfn>${escapeHtml(term.term)}</dfn></h1>
        <p class="term__short">${escapeHtml(term.short)}</p>
        ${
          term.also.length
            ? `<p class="term__also"><span>${escapeHtml(copy.alsoKnown)}</span> ${term.also
                .map((name) => `<em>${escapeHtml(name)}</em>`)
                .join(', ')}</p>`
            : ''
        }
      </header>
      <div class="term__body article-body">
${term.bodyHtml}
      </div>
      <footer class="term__footer">
        ${
          article
            ? `<a class="term__article" href="/${lang}/blog/${article.slug}/"><small>${escapeHtml(
                copy.readMore
              )}</small><strong>${escapeHtml(article.title)}</strong></a>`
            : ''
        }
        ${
          related.length
            ? `<div class="term__related"><h2>${escapeHtml(copy.related)}</h2><ul>${related
                .map(
                  (entry) =>
                    `<li><a href="${glossaryTermPath(lang, entry.slug)}"><strong>${escapeHtml(
                      entry.term
                    )}</strong><span>${escapeHtml(entry.short)}</span></a></li>`
                )
                .join('')}</ul></div>`
            : ''
        }
        <p class="term__back">${escapeHtml(copy.onePage)} <a href="${glossaryHubPath(lang)}">${escapeHtml(
          copy.backToGlossary
        )}</a></p>
      </footer>
    </article>`;

  return renderPage({
    lang,
    canonical,
    title: copy.termMetaTitle(term.term),
    description: term.short,
    alternates: alternatesFor(term.slug, translations),
    schema,
    main,
    languageHrefs: termLanguageHrefs(term.slug, translations),
    current: 'glossary',
    bodyClass: 'term-page',
    skipTarget: 'term',
  });
}

export { GROUPS as GLOSSARY_GROUPS, GROUP_LABELS as GLOSSARY_GROUP_LABELS };
