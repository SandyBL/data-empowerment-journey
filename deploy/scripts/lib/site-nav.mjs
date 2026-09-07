/**
 * The site's navigation: the routes, the labels, and the one header every page
 * family renders.
 *
 * Before this file there were five headers. The homepage had a full navigation
 * with a dropdown and a working mobile drawer; the standalone pages had five
 * flat links that vanished below 1080px with nothing in their place; the blog
 * index, the article template and the confession wall had no site navigation at
 * all -- brand on the left, "all articles" or "home" on the right. So the pages
 * that arriving traffic actually lands on were the ones a reader could not
 * navigate away from, and the confession wall, linked from the footer of every
 * page on the site, was a dead end in both directions.
 *
 * Three of those five headers were also the same design implemented three
 * times: `.dejourney-header`, `.blog-header` and `.wall-header` all resolved to
 * #003366 at 5rem with the same rgb(101 183 199 / .38) accent border. Unifying
 * them is therefore a navigation change and not a redesign -- the bar looks the
 * way the homepage's bar already looked.
 *
 * The taxonomy is grouped by what a reader is trying to do rather than by what
 * the artefact is, which is why the simulators are "practice" and not "tools":
 *
 *   Learn         reading and reference -- no input from you
 *   Practice      the scenario simulators and what the public runs revealed
 *   Tools         you put your own organisation in, you get an artefact out
 *   Get help      the commercial ladder, smallest door first
 *
 * Everything here is exported as data rather than markup wherever a caller
 * might need it differently, because the footer directory, the header, the
 * mobile drawer, the sitemap and llms.txt are five views of one list, and five
 * hand-maintained copies is five chances for a page to quietly stop being
 * linked from anywhere.
 */

import { LOGO, imageCdn } from './brand.mjs';

/**
 * The addresses themselves live in routes.mjs, which holds the per-language URL
 * vocabulary; this file holds what the links are *called*. They are re-exported
 * here because every page family already imports its routes from site-nav, and
 * pointing forty call sites at a second module to gain nothing but a longer
 * import list is not a separation worth having.
 */
export {
  LANGUAGES,
  HOME_PATH,
  pagePath,
  feedPath,
  simulatorPath,
  blogPath,
  articlePath,
  categoryHubPath,
  categoryPath,
  confessionWallPath,
  glossaryHubPath,
  glossaryTermPath,
  localizeInternalLinks,
  X_DEFAULT_LANGUAGE,
  xDefaultLanguage,
  BLOG_SEGMENT,
  CATEGORY_SEGMENT,
  CONFESSION_SEGMENT,
  PAGE_SLUGS,
  TERM_SLUGS,
  localizedPageSlug,
  localizedTermSlug,
  legacyRoutes,
} from './routes.mjs';

import {
  LANGUAGES,
  HOME_PATH,
  pagePath,
  feedPath,
  simulatorPath,
  blogPath,
  confessionWallPath,
} from './routes.mjs';

/** The owned newsletter lives on LinkedIn; there is no on-site archive to link. */
export const NEWSLETTER_URL =
  'https://www.linkedin.com/newsletters/the-data-empowerment-journey-7282492393252147200/';

const escapeAttribute = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Every label the navigation, the footer and the page shells use.
 *
 * One page had three names before this list was the only source: /resources/
 * was "Free tools" in the header, "All resources" in the homepage dropdown and
 * "Tools" as a footer heading. A reader cannot tell that those are one page,
 * and neither can a search engine reading the anchor text.
 */
export const NAV = {
  en: {
    home: 'Home',
    framework: 'Framework',
    blog: 'Insights',
    glossary: 'Glossary',
    faq: 'FAQ',
    resources: 'All free tools',
    consulting: 'Consulting',
    sessions: 'Advisory sessions',
    workshops: 'Workshops',
    about: 'About',
    contact: 'Contact',
    confessionWall: 'Confession Wall',
    simulators: 'Simulators',
    simDayToDay: 'Day-to-day governance',
    simOwnership: 'Who owns this data?',
    simLiteracy: 'Data literacy',
    boardResults: 'What the public runs show',
    calculator: 'Cost of bad data calculator',
    templates: 'Templates',
    playbooks: 'Playbooks',
    maturity: 'Maturity assessment',
    feed: 'RSS feed',
    newsletter: 'Newsletter',
    groupLearn: 'Learn',
    groupPractice: 'Practice',
    groupTools: 'Tools',
    groupWork: 'Get help',
    groupLanguage: 'Language',
    skip: 'Skip to main content',
    breadcrumb: 'Breadcrumb',
    languageNav: 'Language',
    primaryNav: 'Primary navigation',
    mobileNav: 'Site navigation',
    menuOpen: 'Open the navigation menu',
    menuClose: 'Close the navigation menu',
    footerNav: 'Site directory',
    minRead: 'min read',
    rights: 'All rights reserved.',
    builtBy: 'Data governance consulting, tools, and writing by Sandy Bradbury.',
  },
  es: {
    home: 'Inicio',
    framework: 'Marco',
    blog: 'Ideas',
    glossary: 'Glosario',
    faq: 'Preguntas frecuentes',
    resources: 'Todas las herramientas gratuitas',
    consulting: 'Consultoría',
    sessions: 'Sesiones de asesoría',
    workshops: 'Talleres',
    about: 'Sobre',
    contact: 'Contacto',
    confessionWall: 'Muro de Confesiones',
    simulators: 'Simuladores',
    simDayToDay: 'Gobierno del día a día',
    simOwnership: '¿Quién es dueño de estos datos?',
    simLiteracy: 'Alfabetización de datos',
    boardResults: 'Qué muestran las partidas públicas',
    calculator: 'Calculadora del coste de los datos malos',
    templates: 'Plantillas',
    playbooks: 'Playbooks',
    maturity: 'Diagnóstico de madurez',
    feed: 'Feed RSS',
    newsletter: 'Newsletter',
    groupLearn: 'Aprender',
    groupPractice: 'Practicar',
    groupTools: 'Herramientas',
    groupWork: 'Obtener ayuda',
    groupLanguage: 'Idioma',
    skip: 'Saltar al contenido principal',
    breadcrumb: 'Ruta de navegación',
    languageNav: 'Idioma',
    primaryNav: 'Navegación principal',
    mobileNav: 'Navegación del sitio',
    menuOpen: 'Abrir el menú de navegación',
    menuClose: 'Cerrar el menú de navegación',
    footerNav: 'Directorio del sitio',
    minRead: 'min de lectura',
    rights: 'Todos los derechos reservados.',
    builtBy: 'Consultoría, herramientas y artículos de gobierno de datos por Sandy Bradbury.',
  },
  pt: {
    home: 'Início',
    framework: 'Framework',
    blog: 'Ideias',
    glossary: 'Glossário',
    faq: 'Perguntas frequentes',
    resources: 'Todas as ferramentas gratuitas',
    consulting: 'Consultoria',
    sessions: 'Sessões de assessoria',
    workshops: 'Workshops',
    about: 'Sobre',
    contact: 'Contato',
    confessionWall: 'Mural de Confissões',
    simulators: 'Simuladores',
    simDayToDay: 'Governança do dia a dia',
    simOwnership: 'Quem é o dono destes dados?',
    simLiteracy: 'Alfabetização de dados',
    boardResults: 'O que as partidas públicas mostram',
    calculator: 'Calculadora do custo dos dados ruins',
    templates: 'Modelos',
    playbooks: 'Playbooks',
    maturity: 'Diagnóstico de maturidade',
    feed: 'Feed RSS',
    newsletter: 'Newsletter',
    groupLearn: 'Aprender',
    groupPractice: 'Praticar',
    groupTools: 'Ferramentas',
    groupWork: 'Obter ajuda',
    groupLanguage: 'Idioma',
    skip: 'Ir para o conteúdo principal',
    breadcrumb: 'Trilha de navegação',
    languageNav: 'Idioma',
    primaryNav: 'Navegação principal',
    mobileNav: 'Navegação do site',
    menuOpen: 'Abrir o menu de navegação',
    menuClose: 'Fechar o menu de navegação',
    footerNav: 'Diretório do site',
    minRead: 'min de leitura',
    rights: 'Todos os direitos reservados.',
    builtBy: 'Consultoria, ferramentas e artigos de governança de dados por Sandy Bradbury.',
  },
};

/**
 * The four dropdown groups, in header order.
 *
 * Each group holds four or five items on purpose. The list this replaces had
 * grown to a seven-item "Tools" column and an eight-item "Resources" dropdown
 * that mixed reference, tools, community and commercial destinations -- past
 * about five, a dropdown stops being scannable and becomes a list you read.
 *
 * `key` is a NAV key, which is also what a page passes as `current`, so marking
 * the active item needs no second identifier.
 */
export const NAV_GROUPS = [
  {
    key: 'groupLearn',
    id: 'learn',
    items: [
      { key: 'blog', href: (lang) => blogPath(lang) },
      { key: 'glossary', href: (lang) => pagePath(lang, 'glossary') },
      { key: 'faq', href: (lang) => pagePath(lang, 'faq') },
      { key: 'confessionWall', href: (lang) => confessionWallPath(lang) },
      { key: 'newsletter', href: () => NEWSLETTER_URL, external: true },
    ],
  },
  {
    key: 'groupPractice',
    id: 'practice',
    items: [
      { key: 'simDayToDay', href: (lang) => simulatorPath(lang, 'data-governance-day-to-day') },
      { key: 'simOwnership', href: (lang) => simulatorPath(lang, 'data-ownership-conflict') },
      { key: 'simLiteracy', href: (lang) => simulatorPath(lang, 'data-literacy') },
      { key: 'boardResults', href: (lang) => pagePath(lang, 'simulator-results') },
    ],
  },
  {
    key: 'groupTools',
    id: 'tools',
    items: [
      { key: 'maturity', href: (lang) => pagePath(lang, 'maturity-assessment') },
      { key: 'calculator', href: (lang) => pagePath(lang, 'calculator') },
      { key: 'templates', href: (lang) => pagePath(lang, 'templates') },
      { key: 'playbooks', href: (lang) => pagePath(lang, 'playbooks') },
      { key: 'resources', href: (lang) => pagePath(lang, 'resources') },
    ],
  },
  {
    key: 'groupWork',
    id: 'work',
    items: [
      { key: 'consulting', href: (lang) => pagePath(lang, 'consulting') },
      { key: 'sessions', href: (lang) => pagePath(lang, 'advisory-sessions') },
      { key: 'workshops', href: (lang) => pagePath(lang, 'workshops') },
      { key: 'about', href: (lang) => pagePath(lang, 'about') },
      { key: 'contact', href: (lang) => `${HOME_PATH[lang]}#contact-form-start` },
    ],
  },
];

/**
 * The homepage sections that stay sections.
 *
 * `#framework` is the narrative that frames the pitch and makes little sense
 * standing alone, so it keeps its place in the bar as a link back to the
 * homepage rather than becoming a page nobody would search for.
 */
const FRAMEWORK_HREF = (lang) => `${HOME_PATH[lang]}#framework`;

/**
 * The single call to action in the bar.
 *
 * This used to read "Maturity Scorecard" and point at the homepage's
 * `#scorecard` section, which promoted an external Google Form, while
 * /<lang>/maturity-assessment/ was an on-site page doing the same job and also
 * in the navigation. Two routes to one offer under two names split the traffic
 * and the ranking signal between them, so the button now names the page and the
 * page owns the only link to the form.
 */
const CTA = { key: 'maturity', href: (lang) => pagePath(lang, 'maturity-assessment') };

/** The three flags, as inline SVG. Same order in every language. */
const FLAGS = {
  en: `<svg class="lang-flag" viewBox="0 0 28 20" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="20" fill="#fff"/><path fill="#B22234" d="M0 0h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28V7.7H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28V20H0z"/><rect width="12" height="10.78" fill="#3C3B6E"/><g fill="#fff"><circle cx="1.5" cy="1.4" r=".45"/><circle cx="4.5" cy="1.4" r=".45"/><circle cx="7.5" cy="1.4" r=".45"/><circle cx="10.5" cy="1.4" r=".45"/><circle cx="3" cy="3.2" r=".45"/><circle cx="6" cy="3.2" r=".45"/><circle cx="9" cy="3.2" r=".45"/><circle cx="1.5" cy="5" r=".45"/><circle cx="4.5" cy="5" r=".45"/><circle cx="7.5" cy="5" r=".45"/><circle cx="10.5" cy="5" r=".45"/></g></svg>`,
  es: `<svg class="lang-flag" viewBox="0 0 28 20" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="20" fill="#AA151B"/><rect y="5" width="28" height="10" fill="#F1BF00"/><rect x="7" y="8" width="2.2" height="4" rx=".3" fill="#AA151B"/><rect x="7.35" y="7.2" width="1.5" height=".8" fill="#F1BF00" stroke="#AA151B" stroke-width=".3"/></svg>`,
  pt: `<svg class="lang-flag" viewBox="0 0 28 20" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="20" fill="#009B3A"/><path d="M14 2.5 25 10 14 17.5 3 10Z" fill="#FFDF00"/><circle cx="14" cy="10" r="4.2" fill="#002776"/><path d="M10.2 8.8c2.8-.5 5.5.2 7.7 2" fill="none" stroke="#fff" stroke-width=".7"/></svg>`,
};

const SWITCH_LABEL = {
  en: 'Switch language to English',
  es: 'Cambiar idioma a español',
  pt: 'Mudar idioma para português',
};

/**
 * The language switcher, from a map of language to URL.
 *
 * Callers pass the map rather than finished markup because "the same page in
 * Portuguese" means something different per page type -- an article points at
 * its translation's slug, a glossary term at its own, and a page with no
 * counterpart in a language falls back to something that exists. A language
 * absent from the map is left out entirely rather than linked to a 404.
 */
export const renderLanguageSwitcher = (lang, hrefs) => {
  const nav = NAV[lang];
  const links = LANGUAGES.filter((other) => hrefs[other])
    .map(
      (other) =>
        `<a class="lang-btn${other === lang ? ' is-current' : ''}" href="${hrefs[other]}" hreflang="${other}" aria-label="${escapeAttribute(
          SWITCH_LABEL[other]
        )}"${other === lang ? ' aria-current="page"' : ''}>${FLAGS[other]}</a>`
    )
    .join('');
  return `<div class="language-nav" role="navigation" aria-label="${escapeAttribute(nav.languageNav)}">${links}</div>`;
};

/** Convenience for the many pages whose translations are all at the same slug. */
export const pageLanguageHrefs = (slug) =>
  Object.fromEntries(LANGUAGES.map((lang) => [lang, pagePath(lang, slug)]));

const navItem = (item, lang, current, className) => {
  const label = escapeAttribute(NAV[lang][item.key]);
  const external = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const active = item.key === current ? ' aria-current="page"' : '';
  return `<a class="${className}" href="${item.href(lang)}"${external}${active}>${label}</a>`;
};

/** Does this group contain the page being rendered? Used to light up its trigger. */
const groupHolds = (group, current) => group.items.some((item) => item.key === current);

/**
 * The desktop bar: one link, four dropdown groups, one call to action.
 *
 * The panels are opened by the navigation script rather than by CSS `:hover`,
 * so `aria-expanded` never reports "false" on a panel the visitor can see.
 */
const renderDesktopNav = (lang, current) => {
  const nav = NAV[lang];
  const groups = NAV_GROUPS.map((group) => {
    const id = `nav-desktop-${group.id}`;
    const items = group.items.map((item) => navItem(item, lang, current, 'site-nav__item')).join('');
    return `<div class="site-nav__menu${groupHolds(group, current) ? ' is-active' : ''}"><button type="button" class="site-nav__trigger" aria-expanded="false" aria-controls="${id}">${escapeAttribute(
      nav[group.key]
    )}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="site-nav__dropdown" id="${id}">${items}</div></div>`;
  }).join('');

  return `<nav class="site-nav" aria-label="${escapeAttribute(nav.primaryNav)}"><a class="site-nav__link" href="${FRAMEWORK_HREF(
    lang
  )}">${escapeAttribute(nav.framework)}</a>${groups}${navItem(CTA, lang, current, 'site-nav__link site-nav__cta')}</nav>`;
};

/**
 * The drawer, which is the whole navigation below 1180px.
 *
 * The standalone pages used to hide their five links at 1080px and put nothing
 * in their place, so on every phone and most tablets the only way off the page
 * was the logo. Same links as the bar, same order, groups as accordions.
 */
const renderDrawerNav = (lang, current) => {
  const nav = NAV[lang];
  const groups = NAV_GROUPS.map((group) => {
    const id = `nav-drawer-${group.id}`;
    const items = group.items.map((item) => navItem(item, lang, current, 'site-drawer__item')).join('');
    return `<div class="site-drawer__menu"><button type="button" class="site-drawer__trigger" aria-expanded="false" aria-controls="${id}">${escapeAttribute(
      nav[group.key]
    )}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="site-drawer__links" id="${id}" hidden>${items}</div></div>`;
  }).join('');

  return `<nav class="site-drawer" id="site-drawer" aria-label="${escapeAttribute(
    nav.mobileNav
  )}" hidden><div class="site-drawer__panel"><a class="site-drawer__link" href="${FRAMEWORK_HREF(lang)}">${escapeAttribute(
    nav.framework
  )}</a>${groups}${navItem(CTA, lang, current, 'site-drawer__link site-drawer__cta')}</div></nav>`;
};

/**
 * The header every page family renders.
 *
 * `current` is a NAV key or an empty string. `languageHrefs` is the map
 * renderLanguageSwitcher documents; pass nothing to omit the switcher, which no
 * page currently does.
 */
export const renderSiteHeader = (lang, { current = '', languageHrefs = null } = {}) => {
  const nav = NAV[lang];
  const switcher = languageHrefs ? renderLanguageSwitcher(lang, languageHrefs) : '';

  return `<header class="site-header">
    <div class="site-header__inner">
      <a class="dejourney-brand" href="${HOME_PATH[lang]}" aria-label="Data Governance Journey"><img class="dejourney-brand-logo" src="${imageCdn(
        LOGO.url,
        128,
        124
      )}" alt="Data Governance Journey" width="44" height="44" fetchpriority="high" decoding="async"><span class="dejourney-brand-name">Data Governance Journey</span></a>
      ${renderDesktopNav(lang, current)}
      <div class="site-header__actions">${switcher}<button type="button" class="site-nav__toggle" aria-expanded="false" aria-controls="site-drawer" aria-label="${escapeAttribute(
        nav.menuOpen
      )}" data-label-open="${escapeAttribute(nav.menuOpen)}" data-label-close="${escapeAttribute(
        nav.menuClose
      )}"><i class="fa-solid fa-bars" aria-hidden="true"></i></button></div>
    </div>
    ${renderDrawerNav(lang, current)}
  </header>`;
};

/**
 * The footer directory: the same four groups as the header, plus the feed and
 * the language switch.
 *
 * This is the inbound half of every page the site adds. A page whose only
 * referrer is the sitemap is the "discovered -- currently not indexed" case,
 * and a glossary of fifty terms that nothing links to is fifty of them.
 */
export const renderSiteFooter = (lang) => {
  const nav = NAV[lang];
  const column = (heading, links) =>
    `<div><h2>${escapeAttribute(heading)}</h2><ul>${links
      .map(
        ([label, href, external]) =>
          `<li><a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeAttribute(
            label
          )}</a></li>`
      )
      .join('')}</ul></div>`;

  const languageLinks = LANGUAGES.map(
    (other) =>
      `<a href="${HOME_PATH[other]}"${other === lang ? ' aria-current="page"' : ''}>${other.toUpperCase()}</a>`
  ).join('');

  // Same order as the header, so the two read as one navigation. The feed is
  // here and not in the header because nobody hunts for an RSS link in a
  // dropdown, and it would have made Learn a six-item group.
  const columns = NAV_GROUPS.map((group) => {
    const links = group.items.map((item) => [nav[item.key], item.href(lang), item.external]);
    if (group.key === 'groupLearn') links.push([nav.feed, feedPath(lang)]);
    return column(nav[group.key], links);
  }).join('\n      ');

  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <nav class="site-footer__directory" aria-label="${escapeAttribute(nav.footerNav)}">
      ${columns}
      <div>
        <h2>${escapeAttribute(nav.groupLanguage)}</h2>
        <div class="site-footer__languages">${languageLinks}</div>
      </div>
    </nav>
    <p class="site-footer__legal">&copy; ${new Date().getUTCFullYear()} Data Governance Journey. ${escapeAttribute(
      nav.rights
    )} <span>${escapeAttribute(nav.builtBy)}</span></p>
  </div>
</footer>`;
};
