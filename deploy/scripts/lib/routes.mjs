/**
 * The URL vocabulary, per language.
 *
 * Every published address on this site used to be spelled in English, in all
 * three languages: a Spanish reader who searched for "glosario de gobierno de
 * datos" and clicked through landed on /es/glossary/data-governance/. The path
 * is the one part of a result a person reads before deciding to click, and it
 * is a ranking signal in its own right; an English path under /es/ is also the
 * most visible tell that a page is a translation of something else rather than
 * a page written for the reader in front of it. Spanish and Portuguese are the
 * markets this site is trying to own, so those are the paths that had to change.
 *
 * The tables below map the *canonical* slug — which is the English one, and
 * which stays the filename in content/ and the key used everywhere in the
 * build — to the segment each language publishes it at. Content and code keep
 * one identifier per thing; only the address changes. That matters because the
 * canonical slug is also the hreflang cluster key: /es/glosario/metadatos/ and
 * /pt/glossario/metadados/ are known to be translations of each other because
 * both come from `metadata`, not because their paths resemble one another.
 *
 * English is deliberately an identity mapping rather than an absent one, so
 * `localizedSlug` never has to special-case a language and a missing English
 * entry fails the same way a missing Spanish one does.
 *
 * Anything not listed here keeps its canonical slug in every language, which is
 * the right answer for `blog` (a loanword in both Spanish and Portuguese, and
 * what people actually type), `playbooks`, and `dama-dmbok`.
 */

export const LANGUAGES = ['en', 'es', 'pt'];

/**
 * The standalone pages, keyed by the filename in content/pages/<lang>/.
 *
 * `glossary` is in here rather than in a table of its own because the glossary
 * hub is addressed exactly like a standalone page — /<lang>/<segment>/ — and
 * having two tables meant two places to forget.
 */
export const PAGE_SLUGS = {
  en: {
    about: 'about',
    'advisory-sessions': 'advisory-sessions',
    calculator: 'calculator',
    consulting: 'consulting',
    faq: 'faq',
    glossary: 'glossary',
    'maturity-assessment': 'maturity-assessment',
    playbooks: 'playbooks',
    resources: 'resources',
    'simulator-results': 'simulator-results',
    templates: 'templates',
    workshops: 'workshops',
  },
  es: {
    about: 'sobre',
    'advisory-sessions': 'sesiones-de-asesoria',
    calculator: 'calculadora',
    consulting: 'consultoria',
    faq: 'preguntas-frecuentes',
    glossary: 'glosario',
    'maturity-assessment': 'diagnostico-de-madurez',
    playbooks: 'playbooks',
    resources: 'recursos',
    'simulator-results': 'resultados-de-simuladores',
    templates: 'plantillas',
    workshops: 'talleres',
  },
  pt: {
    about: 'sobre',
    'advisory-sessions': 'sessoes-de-assessoria',
    calculator: 'calculadora',
    consulting: 'consultoria',
    faq: 'perguntas-frequentes',
    glossary: 'glossario',
    'maturity-assessment': 'diagnostico-de-maturidade',
    playbooks: 'playbooks',
    resources: 'recursos',
    'simulator-results': 'resultados-dos-simuladores',
    templates: 'modelos',
    workshops: 'workshops',
  },
};

/**
 * The glossary terms, keyed by the filename in content/glossary/<lang>/.
 *
 * Three of these are deliberately left in English in all three languages.
 * "DAMA-DMBOK" is a proper noun; "data steward" and "stewardship" are what
 * Spanish and Portuguese practitioners say and search for — the pages
 * themselves say so, since both list the translated forms under "también
 * llamado" rather than as the headword. Translating the slug would move the
 * page off the phrase it is trying to rank for.
 */
export const TERM_SLUGS = {
  es: {
    'ai-governance': 'gobierno-de-la-ia',
    'business-glossary': 'glosario-de-negocio',
    'cost-of-poor-data-quality': 'coste-de-la-mala-calidad-de-datos',
    'critical-data-element': 'elemento-de-datos-critico',
    'data-catalog': 'catalogo-de-datos',
    'data-classification': 'clasificacion-de-datos',
    'data-culture': 'cultura-de-datos',
    'data-domain': 'dominio-de-datos',
    'data-driven-decision-making': 'toma-de-decisiones-basada-en-datos',
    'data-governance': 'gobierno-de-datos',
    'data-governance-council': 'consejo-de-gobierno-de-datos',
    'data-governance-operating-model': 'modelo-operativo-de-gobierno-de-datos',
    'data-lineage': 'linaje-de-datos',
    'data-literacy': 'alfabetizacion-de-datos',
    'data-management': 'gestion-de-datos',
    'data-maturity': 'madurez-de-datos',
    'data-maturity-model': 'modelo-de-madurez-de-datos',
    'data-owner': 'propietario-de-datos',
    'data-policy': 'politica-de-datos',
    'data-product': 'producto-de-datos',
    'data-profiling': 'perfilado-de-datos',
    'data-quality': 'calidad-de-datos',
    'data-quality-dimensions': 'dimensiones-de-calidad-de-datos',
    'data-quality-rule': 'regla-de-calidad-de-datos',
    'data-standard': 'estandar-de-datos',
    'data-stewardship': 'stewardship-de-datos',
    'decision-rights': 'derechos-de-decision',
    'master-data-management': 'gestion-de-datos-maestros',
    metadata: 'metadatos',
    'personally-identifiable-information': 'informacion-personal-identificable',
    'single-source-of-truth': 'fuente-unica-de-la-verdad',
  },
  pt: {
    'ai-governance': 'governanca-de-ia',
    'business-glossary': 'glossario-de-negocio',
    'cost-of-poor-data-quality': 'custo-da-ma-qualidade-de-dados',
    'critical-data-element': 'elemento-de-dados-critico',
    'data-catalog': 'catalogo-de-dados',
    'data-classification': 'classificacao-de-dados',
    'data-culture': 'cultura-de-dados',
    'data-domain': 'dominio-de-dados',
    'data-driven-decision-making': 'tomada-de-decisao-baseada-em-dados',
    'data-governance': 'governanca-de-dados',
    'data-governance-council': 'conselho-de-governanca-de-dados',
    'data-governance-operating-model': 'modelo-operacional-de-governanca-de-dados',
    'data-lineage': 'linhagem-de-dados',
    'data-literacy': 'alfabetizacao-de-dados',
    'data-management': 'gestao-de-dados',
    'data-maturity': 'maturidade-de-dados',
    'data-maturity-model': 'modelo-de-maturidade-de-dados',
    'data-owner': 'dono-dos-dados',
    'data-policy': 'politica-de-dados',
    'data-product': 'produto-de-dados',
    'data-profiling': 'perfilamento-de-dados',
    'data-quality': 'qualidade-de-dados',
    'data-quality-dimensions': 'dimensoes-de-qualidade-de-dados',
    'data-quality-rule': 'regra-de-qualidade-de-dados',
    'data-standard': 'padrao-de-dados',
    'data-stewardship': 'stewardship-de-dados',
    'decision-rights': 'direitos-de-decisao',
    'master-data-management': 'gestao-de-dados-mestres',
    metadata: 'metadados',
    'personally-identifiable-information': 'informacao-pessoal-identificavel',
    'single-source-of-truth': 'fonte-unica-da-verdade',
  },
};

/** The blog's own segments. `blog` is a loanword in both target languages. */
export const BLOG_SEGMENT = { en: 'blog', es: 'blog', pt: 'blog' };
export const CATEGORY_SEGMENT = { en: 'category', es: 'categoria', pt: 'categoria' };
export const CONFESSION_SEGMENT = {
  en: 'confession-wall',
  es: 'muro-de-confesiones',
  pt: 'mural-de-confissoes',
};

/** Where each language's homepage lives. Spanish keeps the root. */
export const HOME_PATH = { es: '/', en: '/en/', pt: '/pt/' };

const requireLanguage = (lang) => {
  if (!LANGUAGES.includes(lang)) throw new Error(`Unknown language "${lang}"`);
  return lang;
};

/**
 * The segment `slug` is published at in `lang`.
 *
 * Throws on an unknown slug rather than falling through to the canonical one.
 * A silent fallback is how a new page ships at an English address under /es/
 * without anybody noticing: the page renders, the link works, and the only
 * symptom is the thing this module exists to prevent.
 */
export const localizedPageSlug = (lang, slug) => {
  const table = PAGE_SLUGS[requireLanguage(lang)];
  const localized = table[slug];
  if (!localized) {
    throw new Error(
      `No ${lang} URL segment for page "${slug}". Add it to PAGE_SLUGS in scripts/lib/routes.mjs.`
    );
  }
  return localized;
};

/**
 * The segment a glossary term is published at in `lang`.
 *
 * Unlisted terms keep the canonical slug, which is what the three
 * deliberately-untranslated ones rely on, and what a newly added term does
 * until somebody chooses its Spanish and Portuguese wording. That is the
 * opposite of the page table above on purpose: a missing page slug is a
 * structural mistake, while a missing term slug is a translation that has not
 * been written yet, and publishing it in English beats not publishing it.
 */
export const localizedTermSlug = (lang, slug) =>
  TERM_SLUGS[requireLanguage(lang)]?.[slug] ?? slug;

export const pagePath = (lang, slug) => `/${lang}/${localizedPageSlug(lang, slug)}/`;
export const glossaryHubPath = (lang) => pagePath(lang, 'glossary');
export const glossaryTermPath = (lang, slug) =>
  `/${lang}/${localizedPageSlug(lang, 'glossary')}/${localizedTermSlug(lang, slug)}/`;
export const blogPath = (lang) => `/${lang}/${BLOG_SEGMENT[requireLanguage(lang)]}/`;
export const articlePath = (lang, slug) => `${blogPath(lang)}${slug}/`;
export const categoryHubPath = (lang) =>
  `${blogPath(lang)}${CATEGORY_SEGMENT[requireLanguage(lang)]}/`;
export const categoryPath = (lang, slug) => `${categoryHubPath(lang)}${slug}/`;
export const confessionWallPath = (lang) =>
  `/${lang}/${CONFESSION_SEGMENT[requireLanguage(lang)]}/`;
export const feedPath = (lang) => `/${requireLanguage(lang)}/feed.xml`;
export const simulatorPath = (lang, slug) => `/simulators/${requireLanguage(lang)}/${slug}/`;

/**
 * Every address these pages used to be published at, paired with where it went.
 *
 * Renaming a URL without this list turns every existing inbound link, bookmark
 * and indexed result into a 404, which is the one outcome worse than the
 * English path it replaced: a 404 loses the ranking the old URL had earned
 * instead of transferring it. Emitted as 301s by renderRedirects().
 *
 * Only genuine changes are listed. English is unchanged throughout, and a
 * Spanish or Portuguese segment that happens to match its canonical slug
 * (`playbooks`) would produce a rule pointing at itself.
 */
/**
 * Localized segments a page has been published at and has since moved off.
 *
 * The table above only records where a page lives now, so a rename inside a
 * language leaves no trace of the address readers and crawlers already have:
 * `/es/about/` keeps redirecting because the canonical slug is what the loop
 * below iterates, but the retired Spanish spelling would simply 404. Anything
 * ever served under `/<lang>/<segment>/` belongs here for good, oldest first.
 */
const RETIRED_PAGE_SEGMENTS = {
  // "Sobre mí" was the odd one out: English publishes /en/about/ and Portuguese
  // /pt/sobre/, so the possessive made Spanish the only language naming the
  // page after its author rather than its subject.
  es: { about: ['sobre-mi'] },
};

export const legacyRoutes = () => {
  const rules = [];
  const seen = new Set();
  const add = (from, to) => {
    if (from === to || seen.has(from)) return;
    seen.add(from);
    rules.push({ from, to });
  };

  for (const lang of LANGUAGES) {
    for (const slug of Object.keys(PAGE_SLUGS[lang])) {
      add(`/${lang}/${slug}/`, pagePath(lang, slug));
      for (const retired of RETIRED_PAGE_SEGMENTS[lang]?.[slug] ?? []) {
        add(`/${lang}/${retired}/`, pagePath(lang, slug));
      }
    }
    // The glossary moved twice over: the hub segment changed, and so did every
    // term under it. The term rules have to be emitted before the hub's
    // wildcard would be reached, which is why they are separate entries rather
    // than one splat.
    for (const slug of Object.keys(TERM_SLUGS[lang] ?? {})) {
      add(`/${lang}/glossary/${slug}/`, glossaryTermPath(lang, slug));
    }
    add(`/${lang}/confession-wall/`, confessionWallPath(lang));
    add(`/${lang}/blog/category/`, categoryHubPath(lang));
  }
  return rules;
};

/**
 * Rewrites the internal links inside a rendered page to their localized form.
 *
 * Article and glossary Markdown is written against the canonical paths — an
 * author linking to the data-owner definition types /es/glossary/data-owner/,
 * because that is the identifier the rest of the build uses and the one they
 * can look up. Rewriting at render time keeps it that way: there is one spelling
 * of every internal link in content/, and no author has to know that Spanish
 * publishes it at /es/glosario/propietario-de-datos/.
 *
 * Applied to whole documents, so it also localizes the URLs inside the JSON-LD
 * block, where a stale English path would tell a crawler the page's own
 * `relatedLink` and `hasDefinedTerm` targets live somewhere they do not.
 *
 * Idempotent: the patterns only match canonical segments, and no canonical
 * segment is also some other page's localized segment, so running it over
 * already-localized markup changes nothing.
 */
export const localizeInternalLinks = (html) => {
  let output = html;

  for (const lang of LANGUAGES) {
    if (lang === 'en') continue; // English is the canonical spelling already.
    const glossary = localizedPageSlug(lang, 'glossary');

    // Terms first: a page-slug pass would otherwise rewrite the hub segment and
    // leave the term behind it in English.
    for (const [slug, localized] of Object.entries(TERM_SLUGS[lang] ?? {})) {
      output = output.split(`/${lang}/glossary/${slug}/`).join(`/${lang}/${glossary}/${localized}/`);
    }
    for (const [slug, localized] of Object.entries(PAGE_SLUGS[lang])) {
      if (slug === localized) continue;
      output = output.split(`/${lang}/${slug}/`).join(`/${lang}/${localized}/`);
    }
    output = output
      .split(`/${lang}/confession-wall/`)
      .join(confessionWallPath(lang))
      .split(`/${lang}/blog/category/`)
      .join(categoryHubPath(lang));
  }
  return output;
};

/**
 * The language a crawler is pointed at when none of the declared ones match.
 *
 * `x-default` is not "the original" and not "the English one" -- it is the
 * address for a reader whose language this site does not publish, and every
 * page here used to nominate English for that job by default. That is the wrong
 * choice for this site twice over. Spanish is where it competes with the least
 * crowded field, Spanish is where its homepage actually lives (at the root, not
 * under /es/), and the edge function has always negotiated an unrecognised
 * Accept-Language header to Spanish. The hreflang cluster was the last place
 * still saying English.
 */
export const X_DEFAULT_LANGUAGE = 'es';

/**
 * Which of `available` should be nominated as x-default.
 *
 * Falls back in the order given rather than assuming Spanish exists, because a
 * glossary term or article translated into only one language still needs a
 * defensible x-default and pointing it at a page that was never generated is
 * worse than pointing it at the wrong language.
 */
export const xDefaultLanguage = (available = LANGUAGES) => {
  const list = [...available];
  if (list.includes(X_DEFAULT_LANGUAGE)) return X_DEFAULT_LANGUAGE;
  return list.find((lang) => LANGUAGES.includes(lang)) ?? X_DEFAULT_LANGUAGE;
};
