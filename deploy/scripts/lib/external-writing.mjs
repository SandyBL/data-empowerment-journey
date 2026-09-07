/**
 * Articles Sandy Bradbury has published on someone else's blog.
 *
 * The About and Consulting pages made a claim about expertise and then offered
 * nothing outside this domain to check it against: two DAMA certifications and
 * a lot of writing that a sceptical reader can only weigh by reading it. A
 * reader deciding whether to hire someone looks for the work that survived a
 * third party's editorial process, and there is a body of it -- the blog of
 * NowVertical Group, the consultancy this author does data governance work for
 * out of Brazil, in Portuguese, English and Spanish.
 *
 * Every URL below was fetched and confirmed to return 200 with a visible
 * "Sandy Bradbury" byline on the page itself. That is a deliberately narrow
 * rule and it costs us links: several of these articles also exist in English,
 * translated on www.nowvertical.com, where the byline element renders empty.
 * Those editions are omitted. A proof block whose links do not show the author
 * they are cited as proof of is worse than a shorter one, and the first URL
 * supplied for this work turned out to 404, which is the same failure seen from
 * the other side.
 *
 * Sorted newest first, which is also how they render. Adding an entry is the
 * whole cost of publishing another one: the About and Consulting pages in all
 * three languages, the ItemList schema on both, and the counts in neither,
 * because the prose around the block deliberately states no total.
 */

import { SITE_ORIGIN } from './brand.mjs';
import { escapeHtml } from './markdown.mjs';
import { DATE_LOCALE } from './locales.mjs';

/**
 * Where these were published. The Brazilian blog is a separate property on a
 * separate domain rather than a subdirectory of the group site, so it is a
 * separate publisher node -- and the one an ItemList of Portuguese articles
 * should name.
 */
export const PUBLISHERS = {
  group: {
    id: 'https://www.nowvertical.com/#organization',
    name: 'NowVertical Group',
    short: 'NowVertical',
    url: 'https://www.nowvertical.com/',
  },
  brazil: {
    id: 'https://nowvertical-pt.in1.com.br/#organization',
    name: 'NowVertical Brasil',
    short: 'NowVertical Brasil',
    url: 'https://nowvertical-pt.in1.com.br/',
  },
};

/**
 * One entry per article, with one edition per language it was published in.
 *
 * URLs are stored unencoded because the Portuguese slugs carry the accents of
 * the titles they are made from and are far easier to check by eye that way;
 * `href()` percent-encodes them at render time. Do not paste an already-encoded
 * URL in here -- it would be encoded twice.
 */
export const EXTERNAL_WRITING = [
  {
    key: 'telecom-data-paradox',
    editions: {
      pt: {
        title:
          'O Paradoxo dos Dados em Telecomunicações: Como transformar "Caos e Custos" em Segurança e Vantagem Competitiva',
        url: 'https://nowvertical-pt.in1.com.br/blog/o-paradoxo-dos-dados-em-telecomunicações-como-transformar-caos-e-custos-em-segurança-e-vantagem-competitiva',
        published: '2026-08-24',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'right-governance-model',
    editions: {
      pt: {
        title: 'O Modelo Certo de Governança de Dados',
        url: 'https://nowvertical-pt.in1.com.br/blog/o-modelo-certo-de-governanca-de-dados',
        published: '2026-07-21',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'implementation-frameworks',
    editions: {
      pt: {
        title: 'Frameworks para Implementar a Governança de Dados',
        url: 'https://nowvertical-pt.in1.com.br/blog/frameworks-para-implementar-a-governanca-de-dados',
        published: '2026-06-24',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'one-habit-at-a-time',
    editions: {
      pt: {
        title: 'Construindo Governança de Dados, um Hábito de Cada Vez',
        url: 'https://nowvertical-pt.in1.com.br/blog/construindo-governanca-de-dados-um-habito-de-cada-vez',
        published: '2026-05-12',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'data-catalog-implementation',
    editions: {
      pt: {
        title: 'Um Guia Prático para Implementação de Catálogo de Dados',
        url: 'https://nowvertical-pt.in1.com.br/blog/um-guia-pratico-para-implementacao-de-catalogo-de-dados',
        published: '2026-04-16',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'maturity-assessment',
    editions: {
      pt: {
        title: 'Avaliação de Maturidade em Governança de Dados',
        url: 'https://nowvertical-pt.in1.com.br/blog/avaliacao-de-maturidade-em-governanca-de-dados',
        published: '2026-02-09',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'reactive-to-proactive',
    editions: {
      pt: {
        title: 'De Governança de Dados Reativa a Proativa',
        url: 'https://nowvertical-pt.in1.com.br/blog/de-governanca-de-dados-reativa-a-proativa',
        published: '2026-01-26',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'data-literacy-is-essential',
    editions: {
      en: {
        title:
          'Unlocking the True Potential of Data-Driven Businesses: Why Data Literacy is Essential for Successful Data Governance and Management',
        url: 'https://www.nowvertical.com/post/unlocking-the-true-potential-of-data-driven-businesses-why-data-literacy-is-essential-for-successful-data-governance-and-management',
        published: '2025-07-03',
        publisher: 'group',
      },
      es: {
        title:
          'Liberar el verdadero potencial de las empresas impulsadas por los datos: por qué la alfabetización de datos es esencial para una gobernanza y una gestión de datos exitosas',
        url: 'https://www.nowvertical.com/es-ar/post/unlocking-the-true-potential-of-data-driven-businesses-why-data-literacy-is-essential-for-successful-data-governance-and-management',
        published: '2025-07-03',
        publisher: 'group',
      },
      pt: {
        title:
          'Desbloqueando o Verdadeiro Potencial Data-Driven: Por que o Data Literacy é Essencial para uma Governança e Gestão de Dados Bem-Sucedidas',
        url: 'https://nowvertical-pt.in1.com.br/blog/desbloqueando-o-verdadeiro-potencial-data-driven-por-que-o-data-literacy-e-essencial-para-uma-governanca-e-gestao-de-dados-bem-sucedidas',
        published: '2025-07-03',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'people-process-technology-data',
    editions: {
      en: {
        title: 'Why Data Governance is About People, Processes, Technology... and Data',
        url: 'https://www.nowvertical.com/post/why-data-governance-is-about-people-processes-technology-and-data',
        published: '2025-06-20',
        publisher: 'group',
      },
      es: {
        title:
          'Por qué la gobernanza de datos tiene que ver con las personas, los procesos, la tecnología... y los datos',
        url: 'https://www.nowvertical.com/es-ar/post/why-data-governance-is-about-people-processes-technology-and-data',
        published: '2025-06-20',
        publisher: 'group',
      },
      pt: {
        title: 'Por que a Governança de Dados é Sobre Pessoas, Processos, Tecnologia... e Dados',
        url: 'https://nowvertical-pt.in1.com.br/blog/por-que-a-governança-de-dados-e-sobre-pessoas-processos-tecnologia-e-dados',
        published: '2025-06-05',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'what-it-is-and-is-not',
    editions: {
      pt: {
        title: 'Governança de Dados — O que é e o que ela não é',
        url: 'https://nowvertical-pt.in1.com.br/blog/governança-de-dados-o-que-e-o-que-ela-nao-e',
        published: '2025-04-22',
        publisher: 'brazil',
      },
    },
  },
  {
    key: 'role-and-relationship-to-data-management',
    editions: {
      pt: {
        title:
          'O Que É Governança de Dados? Compreendendo Seu Papel e Relação com a Gestão de Dados',
        url: 'https://nowvertical-pt.in1.com.br/blog/o-que-é-governança-de-dados-compreendendo-seu-papel-e-relação-com-a-gestão-de-dados',
        published: '2025-03-28',
        publisher: 'brazil',
      },
    },
  },
];

/** The reader's word for each edition's language, in the reader's language. */
const LANGUAGE_NAMES = {
  en: { en: 'English', es: 'Spanish', pt: 'Portuguese' },
  es: { en: 'inglés', es: 'español', pt: 'portugués' },
  pt: { en: 'inglês', es: 'espanhol', pt: 'português' },
};

const COPY = {
  en: {
    listLabel: 'Articles by Sandy Bradbury on the NowVertical blog',
    otherHeading: 'Written in Portuguese, for NowVertical Brasil',
    alsoIn: 'Also in',
  },
  es: {
    listLabel: 'Artículos de Sandy Bradbury en el blog de NowVertical',
    otherHeading: 'Escritos en portugués, para NowVertical Brasil',
    alsoIn: 'También en',
  },
  pt: {
    listLabel: 'Artigos de Sandy Bradbury no blog da NowVertical',
    otherHeading: 'Escritos em português, para a NowVertical Brasil',
    alsoIn: 'Também em',
  },
};

/**
 * The order editions are offered in for a given reader: their own language
 * first, then the two that read most closely to it. A Spanish reader with no
 * Spanish edition is better served by the Portuguese one than the English.
 */
const EDITION_ORDER = {
  en: ['en', 'es', 'pt'],
  es: ['es', 'pt', 'en'],
  pt: ['pt', 'es', 'en'],
};

const href = (url) => escapeHtml(encodeURI(url));

const formatDate = (iso, lang) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(DATE_LOCALE[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** The edition a reader of `lang` should be sent to, and the rest. */
const orderEditions = (entry, lang) =>
  EDITION_ORDER[lang]
    .filter((editionLang) => entry.editions[editionLang])
    .map((editionLang) => ({ lang: editionLang, ...entry.editions[editionLang] }));

const renderItem = (entry, lang) => {
  const [primary, ...others] = orderEditions(entry, lang);
  const publisher = PUBLISHERS[primary.publisher];
  const names = LANGUAGE_NAMES[lang];
  const meta = [publisher.short, formatDate(primary.published, lang)];

  const alternates = others.length
    ? `<p class="elsewhere-alt">${escapeHtml(COPY[lang].alsoIn)} ${others
        .map(
          (edition) =>
            `<a href="${href(edition.url)}" hreflang="${edition.lang}" target="_blank" rel="noopener">${escapeHtml(
              names[edition.lang]
            )}</a>`
        )
        .join(' · ')}</p>`
    : '';

  return `<li>
          <a class="elsewhere-title" href="${href(primary.url)}" hreflang="${primary.lang}" target="_blank" rel="noopener">${escapeHtml(
            primary.title
          )}</a>
          <p class="elsewhere-meta">${escapeHtml(meta.join(' · '))}</p>${alternates}
        </li>`;
};

/**
 * The proof block itself, placed by `{{EXTERNAL_WRITING}}`.
 *
 * Two lists rather than one, because on the English and Spanish pages most of
 * these articles exist only in Portuguese: mixing them into a single list makes
 * every item's language something the reader has to check, while a second list
 * under its own heading says it once. On the Portuguese page the second list is
 * empty and only the first renders.
 */
export const renderExternalWriting = (lang) => {
  const copy = COPY[lang];
  const translated = EXTERNAL_WRITING.filter((entry) => entry.editions[lang]);
  const untranslated = EXTERNAL_WRITING.filter((entry) => !entry.editions[lang]);

  const list = (entries) =>
    `<ul class="elsewhere-list">
        ${entries.map((entry) => renderItem(entry, lang)).join('\n        ')}
      </ul>`;

  return `    <section class="page-section blog-shell elsewhere" aria-label="${escapeHtml(copy.listLabel)}">
      ${translated.length ? list(translated) : ''}${
        untranslated.length
          ? `
      <h3 class="elsewhere-heading">${escapeHtml(copy.otherHeading)}</h3>
      ${list(untranslated)}`
          : ''
      }
    </section>`;
};

/**
 * The same list as structured data: an ItemList of Article nodes whose author
 * is this site's Person node.
 *
 * This is the half of the block a language model or a rich-results parser can
 * read without inferring anything from prose. Each Article is @id'd by its own
 * URL so the copy on the About page and the copy on the Consulting page are one
 * entity rather than two claims, and every one of them resolves `author` to
 * ${SITE_ORIGIN}/#sandy-bradbury -- the same node the site's own articles name,
 * which is what ties the off-site body of work to the person being hired.
 */
export const externalWritingSchema = (lang, canonical) => {
  const seen = new Set();
  const items = [];

  for (const entry of EXTERNAL_WRITING) {
    for (const edition of orderEditions(entry, lang)) {
      if (seen.has(edition.url)) continue;
      seen.add(edition.url);
      const publisher = PUBLISHERS[edition.publisher];
      items.push({
        '@type': 'Article',
        '@id': encodeURI(edition.url),
        url: encodeURI(edition.url),
        headline: edition.title,
        datePublished: edition.published,
        inLanguage: edition.lang === 'pt' ? 'pt-BR' : edition.lang,
        author: { '@id': `${SITE_ORIGIN}/#sandy-bradbury` },
        publisher: {
          '@type': 'Organization',
          '@id': publisher.id,
          name: publisher.name,
          url: publisher.url,
        },
        isPartOf: {
          '@type': 'Blog',
          '@id': `${publisher.url}#blog`,
          name: `${publisher.name} Blog`,
          publisher: { '@id': publisher.id },
        },
      });
    }
  }

  return {
    '@type': 'ItemList',
    '@id': `${canonical}#external-writing`,
    name: COPY[lang].listLabel,
    inLanguage: lang,
    // No itemListOrder: the block renders the reader's own language first and
    // the Portuguese-only articles after it, so the list is not in date order
    // and claiming that it is would be a claim a parser can check and fail.
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item,
    })),
  };
};

/**
 * NowVertical as an employer, for the Person node.
 *
 * The Person already declares `worksFor` this site's own Organization, which is
 * true and proves nothing: it is the entity the person publishes as. The value
 * of naming the consultancy is that it is the entity the off-site articles were
 * published by, so a consumer reading the ItemList above finds the publisher of
 * those Articles and the employer of their author to be the same organization.
 */
export const EMPLOYER = {
  '@type': 'Organization',
  '@id': PUBLISHERS.group.id,
  name: PUBLISHERS.group.name,
  url: PUBLISHERS.group.url,
};
