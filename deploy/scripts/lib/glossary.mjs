/**
 * The glossary: one page per language, every term a disclosure on it.
 *
 * A glossary is the cheapest thing a site like this can own. Every term is a
 * question somebody types into a search box in the exact words the definition
 * answers — "what is a data steward", "data quality dimensions", "what does
 * DMBOK stand for" — and the definitions are also the internal-linking
 * backbone: a term points at the article that uses it, the articles point back,
 * and a reader who arrived for one definition has somewhere to go.
 *
 * Each definition used to be its own page, on the argument that fifty URLs are
 * fifty chances to match a query where one hub is only one. That argument lost
 * to the measurement. Forty-seven terms in three languages is 141 URLs of about
 * two hundred words each, published in a single week onto a domain seven weeks
 * old; Search Console discovered all of them and crawled almost none — 205 URLs
 * sat in "Discovered, currently not indexed", while the hub, which carries the
 * same text and is the only part of the glossary anything links to, was indexed
 * immediately. Fifty chances to match a query are worth nothing if the pages
 * holding them are never crawled.
 *
 * So the definitions are disclosures on the hub now, opened one at a time like
 * the FAQ, and every retired term URL 301s to its fragment (see legacyRoutes in
 * scripts/lib/routes.mjs). The text is unchanged and none of it is hidden from
 * a crawler — a closed <details> is in the DOM and in the HTML source, which is
 * what Google reads — so the page that was already being indexed simply becomes
 * the page that holds everything.
 *
 * Terms live in content/glossary/<lang>/<slug>.md, one file per term per
 * language, sharing a slug so the languages stay in step. A term that exists in
 * one language and not another publishes anyway, in the language it has.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFrontMatter, renderMarkdown, escapeHtml } from './markdown.mjs';
import { resolveImageSizes } from './media.mjs';
import { SITE_ORIGIN } from './brand.mjs';
import {
  HOME_PATH,
  HTML_LANG,
  LANGUAGES,
  NAV,
  breadcrumbSchema,
  glossaryHubPath,
  renderBreadcrumb,
  renderPage,
  xDefaultLanguage,
} from './page-shell.mjs';
import { glossaryTermAnchor, localizedTermSlug } from './routes.mjs';

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

/**
 * One line under each section heading, saying who the terms in it are for.
 *
 * The hub used to be eight headings and a count, which reads like an index
 * rather than like the rest of the site. `.glossary-group__head p` was already
 * styled for this.
 */
const GROUP_BLURBS = {
  foundations: {
    en: 'The words everything else leans on: what governance is, how far it reaches, and the policies and standards holding it up.',
    es: 'Las palabras sobre las que se apoya todo lo demás: qué es el gobierno, hasta dónde llega y las políticas y estándares que lo sostienen.',
    pt: 'As palavras em que todo o resto se apoia: o que é governança, até onde ela vai e as políticas e padrões que a sustentam.',
  },
  roles: {
    en: 'Who decides, who answers for it, and who does the daily work of keeping data usable.',
    es: 'Quién decide, quién responde y quién hace el trabajo diario de mantener los datos usables.',
    pt: 'Quem decide, quem responde e quem faz o trabalho diário de manter o dado utilizável.',
  },
  metadata: {
    en: 'How your organization knows what data it has, what it means, and where it came from.',
    es: 'Cómo sabe tu organización qué datos tiene, qué significan y de dónde vienen.',
    pt: 'Como a sua organização sabe quais dados tem, o que eles significam e de onde vieram.',
  },
  quality: {
    en: 'Whether the data can be trusted, how you measure that, and what to do when the answer is no.',
    es: 'Si se puede confiar en el dato, cómo se mide eso y qué hacer cuando la respuesta es no.',
    pt: 'Se o dado é confiável, como isso é medido e o que fazer quando a resposta é não.',
  },
  literacy: {
    en: 'The human side: the skills and habits that keep governance alive after the project ends.',
    es: 'El lado humano: las habilidades y los hábitos que mantienen vivo el gobierno cuando el proyecto termina.',
    pt: 'O lado humano: as habilidades e os hábitos que mantêm a governança viva depois que o projeto termina.',
  },
  maturity: {
    en: 'Where you stand today, where you are heading, and how you show that you moved.',
    es: 'Dónde estás hoy, hacia dónde vas y cómo demuestras que te has movido.',
    pt: 'Onde você está hoje, para onde vai e como mostra que saiu do lugar.',
  },
  ai: {
    en: 'What has to be protected, from whom, and what AI changes about both questions.',
    es: 'Qué hay que proteger, de quién, y qué cambia la IA en esas dos preguntas.',
    pt: 'O que precisa ser protegido, de quem, e o que a IA muda nessas duas perguntas.',
  },
  architecture: {
    en: 'How data becomes products, domains and contracts that other teams can build on.',
    es: 'Cómo el dato se convierte en productos, dominios y contratos sobre los que otros equipos pueden construir.',
    pt: 'Como o dado se transforma em produtos, domínios e contratos sobre os quais outros times podem construir.',
  },
};

const COPY = {
  en: {
    kicker: 'Glossary',
    title: 'Data governance glossary',
    metaTitle: 'Data Governance Glossary | Data Governance Journey',
    metaDescription:
      'Plain-language definitions of the data governance, data quality, data literacy and AI governance terms that come up in real programs — what each one means, how it is used, and where it goes wrong.',
    lead: 'Data governance has a vocabulary problem: the same word means three different things in three different meetings. So here is every term you will actually run into, explained the way you would explain it to a colleague — what it means, how it works on a normal Tuesday, and where it usually goes wrong.',
    count: (total) => `${total} ${total === 1 ? 'term' : 'terms'}`,
    alsoKnown: 'Also called',
    inThisSection: 'In this section',
    related: 'Related terms',
    readMore: 'Read more on this',
    jumpTo: 'Where do you want to start?',
    // The visible label is a question; a landmark still needs a plain name.
    jumpAria: 'Glossary sections',
    openHint: 'every definition is on this page — open a term to read it in full.',
  },
  es: {
    kicker: 'Glosario',
    title: 'Glosario de gobierno de datos',
    metaTitle: 'Glosario de Gobierno de Datos | Data Governance Journey',
    metaDescription:
      'Definiciones claras de los términos de gobierno de datos, calidad de datos, alfabetización de datos y gobierno de la IA que aparecen en programas reales: qué significa cada uno, cómo se usa y dónde se malinterpreta.',
    lead: 'El gobierno de datos tiene un problema de vocabulario: la misma palabra significa tres cosas distintas en tres reuniones distintas. Así que aquí está cada término con el que te vas a topar de verdad, explicado como se lo explicarías a un compañero: qué significa, cómo funciona un martes normal y dónde suele romperse.',
    count: (total) => `${total} ${total === 1 ? 'término' : 'términos'}`,
    alsoKnown: 'También llamado',
    inThisSection: 'En esta sección',
    related: 'Términos relacionados',
    readMore: 'Leer más sobre esto',
    jumpTo: '¿Por dónde quieres empezar?',
    jumpAria: 'Secciones del glosario',
    openHint: 'todas las definiciones están en esta página: abre un término para leerla completa.',
  },
  pt: {
    kicker: 'Glossário',
    title: 'Glossário de governança de dados',
    metaTitle: 'Glossário de Governança de Dados | Data Governance Journey',
    metaDescription:
      'Definições claras dos termos de governança de dados, qualidade de dados, alfabetização de dados e governança de IA que aparecem em programas reais: o que cada um significa, como é usado e onde é mal interpretado.',
    lead: 'Governança de dados tem um problema de vocabulário: a mesma palavra significa três coisas diferentes em três reuniões diferentes. Então aqui está cada termo que você vai encontrar de verdade, explicado como você explicaria a um colega: o que significa, como funciona numa terça-feira comum e onde costuma dar errado.',
    count: (total) => `${total} ${total === 1 ? 'termo' : 'termos'}`,
    alsoKnown: 'Também chamado de',
    inThisSection: 'Nesta seção',
    related: 'Termos relacionados',
    readMore: 'Leia mais sobre isso',
    jumpTo: 'Por onde você quer começar?',
    jumpAria: 'Seções do glossário',
    openHint: 'todas as definições estão nesta página: abra um termo para ler por completo.',
  },
};

/**
 * The hub address is per-language -- /es/glosario/ rather than /es/glossary/ --
 * and a term is a fragment on it. Both are built from the tables in routes.mjs
 * and re-exported here because the generator has always imported the glossary's
 * routes from the glossary module.
 */
export { glossaryHubPath, glossaryTermAnchor };

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
      const { html } = renderMarkdown(body, { imageSize: await resolveImageSizes(body, where), lang });
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

const hubLanguageHrefs = () => Object.fromEntries(LANGUAGES.map((other) => [other, glossaryHubPath(other)]));

/**
 * One term, as a disclosure.
 *
 * The id is the localized term slug -- the last segment of the URL this
 * definition used to have -- so /es/glosario/propietario-de-datos/ can 301 to
 * /es/glosario/#propietario-de-datos and land a reader on the same words.
 *
 * The one-line definition sits in the <summary> beside the name, so the page is
 * a usable reference with everything closed: a hub whose entire visible content
 * is a list of names is a doorway page, and this one still answers "what is a
 * data steward" at a glance. The full text is behind the toggle, which is
 * markup rather than a visibility trick -- a closed <details> is in the HTML
 * and in the DOM, so a crawler reads it either way.
 *
 * The <dfn> is what marks the defined phrase to assistive tech. It sits inside
 * a heading rather than replacing it, because forty-seven terms on one page
 * need to be navigable by a screen reader's heading rotor.
 */
const renderTerm = (term, { lang, copy, bySlug, articles }) => {
  const related = term.related.map((slug) => bySlug.get(slug)).filter(Boolean);
  const article = articles.find((entry) => entry.lang === lang && entry.translationKey === term.articleKey);

  const also = term.also.length
    ? `<p class="glossary-term__also"><span>${escapeHtml(copy.alsoKnown)}</span> ${term.also
        .map((name) => `<em>${escapeHtml(name)}</em>`)
        .join(', ')}</p>`
    : '';

  const readMore = article
    ? `<a class="glossary-term__article" href="/${lang}/blog/${article.slug}/"><small>${escapeHtml(
        copy.readMore
      )}</small><strong>${escapeHtml(article.title)}</strong></a>`
    : '';

  const relatedTerms = related.length
    ? `<div class="glossary-term__related"><h4>${escapeHtml(copy.related)}</h4><ul>${related
        .map((entry) => `<li><a href="#${localizedTermSlug(lang, entry.slug)}">${escapeHtml(entry.term)}</a></li>`)
        .join('')}</ul></div>`
    : '';

  const footer =
    readMore || relatedTerms
      ? `\n              <div class="glossary-term__footer">${readMore}${relatedTerms}</div>`
      : '';

  return `          <details class="glossary-term" id="${localizedTermSlug(lang, term.slug)}">
            <summary class="glossary-term__summary">
              <span class="glossary-term__heading">
                <h3 class="glossary-term__name"><dfn>${escapeHtml(term.term)}</dfn></h3>
                <span class="glossary-term__short">${escapeHtml(term.short)}</span>
              </span>
            </summary>
            <div class="glossary-term__panel">${also}
              <div class="glossary-term__body article-body">
${term.bodyHtml}
              </div>${footer}
            </div>
          </details>`;
};

/**
 * The glossary page for one language: every term it has, grouped, each a
 * disclosure.
 *
 * `articles` is the whole article list rather than this language's slice,
 * because the front matter names an article by its translation key and the link
 * has to resolve into the reader's own language.
 */
export function renderGlossaryHub(lang, terms, articles) {
  const copy = COPY[lang];
  const nav = NAV[lang];
  const localized = terms
    .filter((term) => term.lang === lang)
    .sort((first, second) => first.term.localeCompare(second.term, lang));
  const canonical = `${SITE_ORIGIN}${glossaryHubPath(lang)}`;
  const bySlug = new Map(localized.map((entry) => [entry.slug, entry]));

  const grouped = GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group][lang],
    blurb: GROUP_BLURBS[group][lang],
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
          <p>${escapeHtml(section.blurb)}</p>
          <span>${copy.count(section.terms.length)}</span>
        </div>
        <div class="glossary-list">
${section.terms.map((term) => renderTerm(term, { lang, copy, bySlug, articles })).join('\n')}
        </div>
      </section>`
    )
    .join('\n');

  const breadcrumb = [
    { name: nav.home, item: `${SITE_ORIGIN}${HOME_PATH[lang]}` },
    { name: copy.kicker, item: canonical },
  ];

  /**
   * Every definition is a DefinedTerm node on this page, with its fragment as
   * @id and url. The nodes used to be bare references to the term pages' own
   * @ids; with those pages gone a reference would point at nothing.
   *
   * dateModified is the newest `updated` across the terms, because the hub now
   * changes whenever any definition does and that is the date a crawler should
   * see.
   */
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
        ...(() => {
          const modified = localized
            .map((term) => term.updated)
            .filter(Boolean)
            .sort()
            .pop();
          return modified ? { dateModified: modified } : {};
        })(),
        hasDefinedTerm: localized.map((term) => ({
          '@type': 'DefinedTerm',
          '@id': `${canonical}#${localizedTermSlug(lang, term.slug)}`,
          name: term.term,
          description: term.short,
          url: `${canonical}#${localizedTermSlug(lang, term.slug)}`,
          inDefinedTermSet: { '@id': `${canonical}#glossary` },
          ...(term.also.length ? { alternateName: term.also } : {}),
        })),
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
      <p class="page-meta">${copy.count(localized.length)} · ${escapeHtml(copy.openHint)}</p>
    </section>
    <nav class="glossary-jump blog-shell" aria-label="${escapeHtml(copy.jumpAria)}"><span>${escapeHtml(
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
      { hreflang: 'x-default', url: glossaryHubPath(xDefaultLanguage()) },
    ],
    schema,
    main,
    languageHrefs: hubLanguageHrefs(),
    current: 'glossary',
    bodyClass: 'glossary-page',
    // Opens whichever term a link or a redirect asked for. The page works
    // without it -- the fragment still scrolls -- but the reader would arrive
    // at a closed disclosure and have to click the thing they just clicked.
    extraScripts: '  <script type="module" src="/assets/js/glossary.js"></script>\n',
  });
}

export { GROUPS as GLOSSARY_GROUPS, GROUP_LABELS as GLOSSARY_GROUP_LABELS };
