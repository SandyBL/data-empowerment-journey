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
    .concat(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/">`)
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

/** Renders the master template into the finished page for one language. */
export const renderHomePage = (template, schemaGraph, lang) => {
  const metadata = PAGE_METADATA[lang];
  if (!metadata) throw new Error(`No homepage metadata for language "${lang}"`);

  let page = stripOtherLanguages(template, lang);
  page = localizeLinks(page, lang);

  return page
    .replace('<!--BUILD:METADATA-->', renderMetadata(lang))
    .replace('<!--BUILD:SCHEMA-->', renderSchema(schemaGraph, lang))
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
