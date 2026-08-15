/**
 * Builds the JSON-LD graph for a blog index page.
 *
 * The three archive pages carried no structured data at all: nothing said they
 * were the blog, nothing listed what was on them, and nothing tied them to the
 * Blog node every article already claims to be part of. An assistant reading an
 * article could see it belonged to a blog it had no way to fetch or enumerate.
 *
 * The list is deliberately lightweight — position, title, and URL per post
 * rather than a second full copy of each article's metadata. The article pages
 * are the authority for their own contents; repeating them here would create two
 * descriptions of the same thing that can disagree.
 */

import { OG_IMAGE, SITE_ORIGIN } from './brand.mjs';

const BLOG_METADATA = {
  en: {
    name: 'Data Governance Insights',
    description: 'Practical insight on data governance, data culture, literacy, quality, and responsible AI.',
    home: '/en/',
  },
  es: {
    name: 'Ideas sobre Gobierno de Datos',
    description: 'Ideas prácticas sobre gobierno, cultura, alfabetización, calidad de datos e IA responsable.',
    home: '/',
  },
  pt: {
    name: 'Ideias sobre Governança de Dados',
    description: 'Ideias práticas sobre governança, cultura, alfabetização, qualidade de dados e IA responsável.',
    home: '/pt/',
  },
};

/**
 * @param lang          the archive's language
 * @param htmlLanguage  BCP 47 tag for that language
 * @param articles      that language's articles, newest first
 * @param labels        the LABELS entry for the language, for breadcrumb names
 */
export const renderBlogIndexSchema = (lang, htmlLanguage, articles, labels) => {
  const metadata = BLOG_METADATA[lang];
  if (!metadata) throw new Error(`No blog index metadata for language "${lang}"`);

  const url = `${SITE_ORIGIN}/${lang}/blog/`;

  const graph = [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: metadata.name,
      description: metadata.description,
      inLanguage: htmlLanguage,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
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
      breadcrumb: { '@id': `${url}#breadcrumb` },
      mainEntity: { '@id': `${url}#posts` },
    },
    // The same @id every article's isPartOf points at, so the whole language
    // resolves to one blog rather than one per page that mentions it.
    {
      '@type': 'Blog',
      '@id': `${url}#blog`,
      url,
      name: metadata.name,
      description: metadata.description,
      inLanguage: htmlLanguage,
      author: { '@id': `${SITE_ORIGIN}/#sandy-bradbury` },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#posts`,
      name: metadata.name,
      numberOfItems: articles.length,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${SITE_ORIGIN}/${lang}/blog/${article.slug}/`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: labels.breadcrumbHome,
          item: `${SITE_ORIGIN}${metadata.home}`,
        },
        { '@type': 'ListItem', position: 2, name: labels.breadcrumbBlog, item: url },
      ],
    },
  ];

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .split('\n')
    .join('\n  ');
  return `\n  <script type="application/ld+json">\n  ${json}\n  </script>\n  `;
};
