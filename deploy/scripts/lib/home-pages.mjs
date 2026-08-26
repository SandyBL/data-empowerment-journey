/**
 * Renders the trilingual homepage master (src/home.html) into one static page
 * per language.
 *
 * The homepage used to ship all three languages in the same document and let a
 * script hide two of them. Browsers coped; the crawlers behind AI assistants
 * mostly do not run JavaScript or apply CSS, so they read the raw markup and saw
 * every sentence three times in three languages. This module removes the two
 * languages that are not being built, so each published page contains exactly
 * one language in its source, and bakes in the metadata and links that the old
 * script used to patch in at runtime.
 */

import { OG_IMAGE, SITE_ORIGIN } from './brand.mjs';

/** Where each language's homepage lives. Spanish keeps the root. */
export const HOME_PATH = { es: '/', en: '/en/', pt: '/pt/' };

const HTML_LANG = { en: 'en', es: 'es', pt: 'pt-BR' };
// pt_BR, not pt_PT: the Portuguese copy across this site is Brazilian
// (“você”, “Anônimo”, R$ figures in the simulators), and the blog generator
// and the confession wall both already say so. Three files disagreeing meant
// the homepage advertised a variant the page is not written in.
const OG_LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR' };

const PAGE_METADATA = {
  es: {
    title: 'Data Governance Journey | Gobierno de Datos & Cultura de Datos',
    description:
      'Consultoría estratégica en Gobierno de Datos, Cultura y Alfabetización en Datos basada en el marco DAMA. Orquestamos personas, procesos y tecnología.',
    socialTitle: 'Data Governance Journey | Gobierno de Datos',
    socialDescription:
      'Convertimos los datos en activos estratégicos orquestando personas, procesos y tecnología. Basado en DAMA.',
    ariaBlog: 'Abrir el blog',
    ariaConfession: 'Visitar el Muro de Confesiones',
    ariaBrand: 'Data Governance Journey, ir al inicio',
    ariaSectionNav: 'Navegación por secciones',
    ariaContentLinks: 'Blog, newsletter y Muro de Confesiones',
    ariaNewsletter: 'Abrir la newsletter de Data Governance Journey',
    ariaMenuOpen: 'Abrir el menú de navegación',
    ariaMenuClose: 'Cerrar el menú de navegación',
    ariaMobileNav: 'Navegación móvil',
    ariaContactOptions: 'Opciones de contacto',
    ariaDirectory: 'Directorio del sitio',
    ariaDeliverables: 'Entregables del diagnóstico',
    skipLink: 'Saltar al contenido principal',
  },
  en: {
    title: 'Data Governance Journey | Data Governance & Data Culture Consulting',
    description:
      'Strategic Data Governance, Data Culture, and Data Literacy consulting based on the DAMA framework. We orchestrate people, processes, and technology.',
    socialTitle: 'Data Governance Journey | Data Governance',
    socialDescription:
      'We turn data into a strategic asset by orchestrating people, processes, and technology. Built on DAMA.',
    ariaBlog: 'Open the blog',
    ariaConfession: 'Visit the Confession Wall',
    ariaBrand: 'Data Governance Journey, go to home',
    ariaSectionNav: 'Section navigation',
    ariaContentLinks: 'Blog, newsletter, and Confession Wall',
    ariaNewsletter: 'Open the Data Governance Journey newsletter',
    ariaMenuOpen: 'Open the navigation menu',
    ariaMenuClose: 'Close the navigation menu',
    ariaMobileNav: 'Mobile navigation',
    ariaContactOptions: 'Contact options',
    ariaDirectory: 'Site directory',
    ariaDeliverables: 'Assessment deliverables',
    skipLink: 'Skip to main content',
  },
  pt: {
    title: 'Data Governance Journey | Governança de Dados & Cultura de Dados',
    description:
      'Consultoria estratégica em Governança de Dados, Cultura e Alfabetização em Dados baseada no framework DAMA. Orquestramos pessoas, processos e tecnologia.',
    socialTitle: 'Data Governance Journey | Governança de Dados',
    socialDescription:
      'Transformamos dados em ativos estratégicos orquestrando pessoas, processos e tecnologia. Baseado no DAMA.',
    ariaBlog: 'Abrir o blog',
    ariaConfession: 'Visitar o Mural de Confissões',
    ariaBrand: 'Data Governance Journey, ir para o início',
    ariaSectionNav: 'Navegação por seções',
    ariaContentLinks: 'Blog, newsletter e Mural de Confissões',
    ariaNewsletter: 'Abrir a newsletter da Data Governance Journey',
    ariaMenuOpen: 'Abrir o menu de navegação',
    ariaMenuClose: 'Fechar o menu de navegação',
    ariaMobileNav: 'Navegação móvel',
    ariaContactOptions: 'Opções de contato',
    ariaDirectory: 'Diretório do site',
    ariaDeliverables: 'Entregáveis do diagnóstico',
    skipLink: 'Ir para o conteúdo principal',
  },
};

const DATE_LOCALE = { en: 'en-US', es: 'es-ES', pt: 'pt-BR' };

/**
 * Copy for the latest-articles block. It is written here rather than in
 * src/home.html because the cards themselves are generated, and splitting the
 * heading from the thing it heads is how the two drift apart.
 */
const JOURNAL_COPY = {
  en: {
    kicker: 'From the journal',
    heading: 'Latest thinking on data governance',
    lead: 'New writing on governance, culture, literacy, and responsible AI — practical enough to use on Monday.',
    minRead: 'min read',
    read: 'Read article',
    all: 'Read every article',
  },
  es: {
    kicker: 'Desde el journal',
    heading: 'Lo último sobre gobierno de datos',
    lead: 'Nuevos artículos sobre gobierno de datos, cultura, alfabetización e IA responsable: ideas prácticas que puedes aplicar desde el primer día.',
    minRead: 'min de lectura',
    read: 'Leer artículo',
    all: 'Ver todos los artículos',
  },
  pt: {
    kicker: 'Do journal',
    heading: 'O mais recente sobre governança de dados',
    lead: 'Novos artigos sobre governança de dados, cultura, alfabetização e IA responsável: ideias práticas que você pode aplicar desde o primeiro dia.',
    minRead: 'min de leitura',
    read: 'Ler artigo',
    all: 'Ver todos os artigos',
  },
};

/** How many cards the block shows. Three fills one row at every breakpoint. */
const JOURNAL_CARDS = 3;

const escapeAttribute = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Removes every element carrying a `data-lang-content` attribute for a language
 * other than the one being built.
 *
 * A regular expression cannot do this safely because the elements nest, so this
 * walks the tag stream from each unwanted opening tag and counts depth until the
 * matching close. Only div, p, and span carry the attribute, and none of them is
 * void, so tracking one tag name at a time is enough.
 */
const stripOtherLanguages = (html, lang) => {
  const opening = /<(div|p|span)\b[^>]*?\sdata-lang-content="([a-z-]+)"[^>]*>/gi;
  let output = html;
  let cursor = 0;

  for (;;) {
    opening.lastIndex = cursor;
    const match = opening.exec(output);
    if (!match) return output;
    if (match[2] === lang) {
      // Keep it and resume just after its opening tag, so a nested block in
      // another language is still found rather than skipped over.
      cursor = match.index + match[0].length;
      continue;
    }
    output = output.slice(0, match.index) + output.slice(findElementEnd(output, match.index, match[1]));
    cursor = match.index;
  }
};

/** Returns the index just past the closing tag that matches the tag at `start`. */
const findElementEnd = (html, start, tagName) => {
  const tags = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi');
  tags.lastIndex = start;
  let depth = 0;
  let tag;
  while ((tag = tags.exec(html))) {
    depth += tag[1] === '/' ? -1 : 1;
    if (depth === 0) return tag.index + tag[0].length;
  }
  throw new Error(`Unbalanced <${tagName}> in the homepage template at offset ${start}`);
};

/**
 * The old script rewrote these links whenever the visitor switched language.
 * With one page per language they are plain, crawlable, single-value hrefs.
 */
const localizeLinks = (html, lang) =>
  html
    .replace(/href="\/es\/confession-wall\/"(\s+class="language-confession-link)/g, `href="/${lang}/confession-wall/"$1`)
    .replace(/href="\/es\/blog\/"(\s+id="header-blog-link")/g, `href="/${lang}/blog/"$1`)
    .replace(/href="\/simulators\/es\/([a-z-]+)\/"(\s+class="language-simulator-link")/g, `href="/simulators/${lang}/$1/"$2`)
    // Downloads and the maturity scorecard carry all three targets as data
    // attributes; promote the one for this language into href and download.
    .replace(/<a\s[^>]*\bdata-(?:es|en|pt)="[^"]*"[^>]*>/g, (anchor) => {
      const target = anchor.match(new RegExp(`\\sdata-${lang}="([^"]*)"`));
      if (!target) return anchor;
      return anchor
        .replace(/\shref="[^"]*"/, ` href="${target[1]}"`)
        .replace(/\sdownload="[^"]*"/, ` download="${target[1].split('/').pop()}"`);
    });

/** The per-language head block that replaces the old runtime metadata patching. */
const renderMetadata = (lang) => {
  const metadata = PAGE_METADATA[lang];
  const canonical = `${SITE_ORIGIN}${HOME_PATH[lang]}`;
  const alternates = Object.entries(HOME_PATH)
    .map(([other, route]) => `    <link rel="alternate" hreflang="${other}" href="${SITE_ORIGIN}${route}">`)
    // x-default is the address for a visitor none of the other three match, and
    // that is now literally true of "/": netlify/edge-functions/
    // language-negotiation.ts reads Accept-Language there and only sends the
    // visitor elsewhere when it recognises their language, so an unmatched one
    // stays. It used to name "/en/", which claimed a fallback the server never
    // performed — hreflang describing behaviour the site does not have is the
    // one thing Google's localisation guidance asks you not to ship.
    .concat(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${HOME_PATH.es}">`)
    .join('\n');
  const alternateLocales = Object.keys(OG_LOCALE)
    .filter((other) => other !== lang)
    .map((other) => `    <meta property="og:locale:alternate" content="${OG_LOCALE[other]}">`)
    .join('\n');

  return `<title>${escapeAttribute(metadata.title)}</title>
    <meta name="description" content="${escapeAttribute(metadata.description)}">
    <link rel="canonical" href="${canonical}">
${alternates}

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Data Governance Journey">
    <meta property="og:title" content="${escapeAttribute(metadata.socialTitle)}">
    <meta property="og:description" content="${escapeAttribute(metadata.socialDescription)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
    <meta property="og:image:width" content="${OG_IMAGE.width}">
    <meta property="og:image:height" content="${OG_IMAGE.height}">
    <meta property="og:image:alt" content="${escapeAttribute(OG_IMAGE.alt)}">
    <meta property="og:locale" content="${OG_LOCALE[lang]}">
${alternateLocales}

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeAttribute(metadata.socialTitle)}">
    <meta name="twitter:description" content="${escapeAttribute(metadata.socialDescription)}">
    <meta name="twitter:image" content="${SITE_ORIGIN}${OG_IMAGE.url}">
    <meta name="twitter:image:alt" content="${escapeAttribute(OG_IMAGE.alt)}">`;
};

/**
 * Narrows the shared JSON-LD graph to one language.
 *
 * The graph holds one FAQPage per language. Publishing all three on every page
 * would tell an assistant that the English homepage answers questions in
 * Spanish, so each page keeps only its own — re-pointed at its own URL.
 */
const renderSchema = (graph, lang) => {
  const homeUrl = `${SITE_ORIGIN}${HOME_PATH[lang]}`;
  const nodes = graph['@graph']
    .filter((node) => node['@type'] !== 'FAQPage' || (node['@id'] || '').includes(`lang=${lang}`) || (node.inLanguage || '').startsWith(lang))
    .map((node) => {
      const localized = JSON.parse(JSON.stringify(node));
      if (localized['@type'] === 'FAQPage') {
        localized['@id'] = `${homeUrl}#faq`;
        localized.url = homeUrl;
        localized.isPartOf = { '@id': `${SITE_ORIGIN}/#website` };
      }
      // The archive search is per-language, so the searchbox an assistant or a
      // search engine builds from this node has to point at the archive the
      // reader is actually on — otherwise a Portuguese visitor's query lands in
      // the Spanish index.
      if (localized['@type'] === 'WebSite' && localized.potentialAction?.target) {
        localized.potentialAction.target.urlTemplate = `${SITE_ORIGIN}/${lang}/blog/?q={search_term_string}`;
      }
      return localized;
    });

  return `<script type="application/ld+json">
    ${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }, null, 4).split('\n').join('\n    ')}
    </script>`;
};

/**
 * The "from the journal" block, rendered into <!--BUILD:LATEST-->.
 *
 * The homepage carried thirty-one links and not one of them reached an article:
 * every route into the blog stopped at the language's index page, so an article
 * was three clicks from the site's only strongly-linked page and Google left a
 * good part of the archive at "discovered — currently not indexed". These cards
 * are plain server-rendered anchors, so they count as links to a crawler that
 * runs no JavaScript, and they change whenever an article is published — which
 * is also what the homepage's derived sitemap lastmod now reports.
 *
 * Returns an empty string when a language has no articles rather than an empty
 * shell, so the section simply does not exist instead of being visibly bare.
 */
export const renderLatestArticles = (articles, lang) => {
  const copy = JOURNAL_COPY[lang];
  const localized = (articles || [])
    .filter((article) => article.lang === lang)
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, JOURNAL_CARDS);
  if (!localized.length) return '';

  const formatDate = (isoDate) =>
    new Intl.DateTimeFormat(DATE_LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric' }).format(
      new Date(`${isoDate}T12:00:00Z`)
    );

  const cards = localized
    .map((article) => {
      const href = `/${lang}/blog/${article.slug}/`;
      return `                <article class="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
                    <div class="p-8 flex-grow">
                        <p class="text-emeraldgreen text-xs font-bold uppercase tracking-widest mb-2">${escapeAttribute(article.category)}</p>
                        <h3 class="text-xl font-extrabold text-deepblue leading-tight mb-3"><a href="${href}">${escapeAttribute(article.title)}</a></h3>
                        <p class="text-slate-600 leading-relaxed">${escapeAttribute(article.summary)}</p>
                    </div>
                    <div class="px-8 pb-8">
                        <p class="text-slate-500 text-xs font-semibold mb-4"><time datetime="${article.date}">${formatDate(article.date)}</time> · ${article.readingTime} ${copy.minRead}</p>
                        <a href="${href}" class="inline-flex items-center gap-2 text-deepblue text-sm font-bold">${copy.read}<i class="fa-solid fa-arrow-right text-emeraldgreen" aria-hidden="true"></i></a>
                    </div>
                </article>`;
    })
    .join('\n');

  return `<section id="journal" class="scroll-mt-20 py-20 bg-white border-t border-slate-200" aria-labelledby="journal-heading">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12">
                <p class="text-emeraldgreen text-xs font-bold uppercase tracking-widest mb-2">${copy.kicker}</p>
                <h2 id="journal-heading" class="text-3xl font-extrabold text-deepblue tracking-tight">${copy.heading}</h2>
                <div class="w-16 h-1 bg-emeraldgreen mx-auto my-5 rounded-full"></div>
                <p class="text-slate-600 font-light leading-relaxed">${copy.lead}</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
${cards}
            </div>
            <div class="text-center">
                <a href="/${lang}/blog/" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-deepblue text-white text-sm font-bold hover:bg-deepblue/90 transition-all">${copy.all}<i class="fa-solid fa-arrow-right text-emeraldgreen" aria-hidden="true"></i></a>
            </div>
        </div>
    </section>`;
};

/** Renders the master template into the finished page for one language. */
export const renderHomePage = (template, schemaGraph, lang, articles = []) => {
  const metadata = PAGE_METADATA[lang];
  if (!metadata) throw new Error(`No homepage metadata for language "${lang}"`);

  let page = stripOtherLanguages(template, lang);
  page = localizeLinks(page, lang);

  return page
    .replace('<!--BUILD:METADATA-->', renderMetadata(lang))
    .replace('<!--BUILD:SCHEMA-->', renderSchema(schemaGraph, lang))
    // A function replacement, not a string: an article title containing "$&"
    // or "$'" would otherwise be read as a replacement pattern.
    .replace('<!--BUILD:LATEST-->', () => renderLatestArticles(articles, lang))
    .replace(/__HTML_LANG__/g, HTML_LANG[lang])
    .replace(/__LANG__/g, lang)
    // Stamped at build time rather than written into the template: a literal
    // year in the footer is correct for twelve months and then quietly wrong,
    // and nobody notices a copyright notice until it looks abandoned.
    .replace(/__YEAR__/g, String(new Date().getUTCFullYear()))
    .replace(/__ARIA_BLOG__/g, escapeAttribute(metadata.ariaBlog))
    .replace(/__ARIA_CONFESSION__/g, escapeAttribute(metadata.ariaConfession))
    .replace(/__ARIA_BRAND__/g, escapeAttribute(metadata.ariaBrand))
    .replace(/__ARIA_SECTION_NAV__/g, escapeAttribute(metadata.ariaSectionNav))
    .replace(/__ARIA_CONTENT_LINKS__/g, escapeAttribute(metadata.ariaContentLinks))
    .replace(/__ARIA_NEWSLETTER__/g, escapeAttribute(metadata.ariaNewsletter))
    .replace(/__ARIA_MENU_OPEN__/g, escapeAttribute(metadata.ariaMenuOpen))
    .replace(/__ARIA_MENU_CLOSE__/g, escapeAttribute(metadata.ariaMenuClose))
    .replace(/__ARIA_MOBILE_NAV__/g, escapeAttribute(metadata.ariaMobileNav))
    .replace(/__ARIA_CONTACT_OPTIONS__/g, escapeAttribute(metadata.ariaContactOptions))
    .replace(/__ARIA_DIRECTORY__/g, escapeAttribute(metadata.ariaDirectory))
    .replace(/__ARIA_DELIVERABLES__/g, escapeAttribute(metadata.ariaDeliverables))
    .replace(/__SKIP_LINK__/g, escapeAttribute(metadata.skipLink))
    .replace(/__HOME_SELF__/g, HOME_PATH[lang])
    .replace(/__HOME_EN__/g, HOME_PATH.en)
    .replace(/__HOME_ES__/g, HOME_PATH.es)
    .replace(/__HOME_PT__/g, HOME_PATH.pt);
};
