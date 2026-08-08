/**
 * Builds the JSON-LD graph for an article page.
 *
 * The graph used to say only that a BlogPosting existed and who wrote it. That
 * is enough for a rich result and not much else: nothing connected the article
 * to the topics it covers, to the site's organisation and author entities, or to
 * the questions it answers. Assistants that answer from structured data have no
 * way to tell "an article about data governance" from "an article that mentions
 * data governance once" without it.
 *
 * So this adds three things:
 *   - about / mentions, tied to Wikidata and Wikipedia so the topic is an entity
 *     rather than a string;
 *   - stable @id references into the same Organization and Person nodes the
 *     homepage declares, so the whole site resolves to one author and one
 *     publisher instead of a new pair per page;
 *   - a FAQPage assembled from the article's own question headings, which is
 *     where the direct answers already are.
 */

const SITE_ORIGIN = 'https://datagovjourney.com';

/**
 * Topics the site writes about, as entities.
 *
 * `match` is tried against the article's title, summary, category, and body; a
 * topic matched by the category or the title is what the article is `about`,
 * anything else it merely `mentions`.
 */
const TOPICS = [
  {
    name: 'Data governance',
    match: /\b(data governance|gobierno de datos|gobernanza de datos|governan[çc]a de dados)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Data_governance', 'https://www.wikidata.org/wiki/Q5227240'],
  },
  {
    name: 'Data management',
    match: /\b(data management|gesti[óo]n de datos|gest[ãa]o de dados|DMBOK|DAMA)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Data_management', 'https://www.wikidata.org/wiki/Q1149776'],
  },
  {
    name: 'Data quality',
    match: /\b(data quality|calidad de (los )?datos|qualidade (dos )?dados)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Data_quality', 'https://www.wikidata.org/wiki/Q1780962'],
  },
  {
    name: 'Data literacy',
    match: /\b(data literacy|alfabetizaci[óo]n (de|en) datos|alfabetiza[çc][ãa]o (de|em) dados)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Data_literacy', 'https://www.wikidata.org/wiki/Q105776957'],
  },
  {
    name: 'Data steward',
    match: /\b(data steward(ship)?|custodio de datos|administraci[óo]n de datos|curadoria de dados)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Data_steward', 'https://www.wikidata.org/wiki/Q5227256'],
  },
  {
    name: 'Master data management',
    match: /\b(master data|datos maestros|dados mestres|MDM)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Master_data_management', 'https://www.wikidata.org/wiki/Q1093467'],
  },
  {
    name: 'Metadata',
    match: /\b(metadata|metadatos|metadados|business glossary|glosario|gloss[áa]rio|data catalog|cat[áa]logo de datos)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Metadata', 'https://www.wikidata.org/wiki/Q180160'],
  },
  {
    name: 'Artificial intelligence',
    match: /\b(artificial intelligence|inteligencia artificial|intelig[êe]ncia artificial|\bAI\b|\bIA\b|machine learning)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Artificial_intelligence', 'https://www.wikidata.org/wiki/Q11660'],
  },
  {
    name: 'Data privacy',
    match: /\b(privacy|privacidad|privacidade|GDPR|RGPD|LGPD)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Information_privacy', 'https://www.wikidata.org/wiki/Q1141176'],
  },
  {
    name: 'Change management',
    match: /\b(change management|gesti[óo]n del cambio|gest[ãa]o da mudan[çc]a|data culture|cultura de datos|cultura de dados)\b/i,
    sameAs: ['https://en.wikipedia.org/wiki/Change_management', 'https://www.wikidata.org/wiki/Q1062789'],
  },
];

const asThing = (topic) => ({ '@type': 'Thing', name: topic.name, sameAs: topic.sameAs });

/**
 * Splits the site's topics into what the article is about and what it mentions.
 *
 * Everything is `about` on a page that names it in its title or category, which
 * is the claim search engines weigh; the rest is `mentions`, which is the weaker
 * and more honest claim for a topic that appears once in the body.
 */
const classifyTopics = (article) => {
  const prominent = `${article.title} ${article.category} ${article.summary}`;
  const about = [];
  const mentions = [];

  for (const topic of TOPICS) {
    if (topic.match.test(prominent)) about.push(asThing(topic));
    else if (topic.match.test(article.body)) mentions.push(asThing(topic));
  }
  return { about, mentions };
};

/**
 * Turns the article's question headings into FAQ entries.
 *
 * Only headings that are literally questions qualify, and only when prose
 * follows them — an invented question, or one answered by a table the schema
 * cannot carry, would be a structured-data claim the page does not support.
 *
 * Sections holding a call-to-action link are skipped too. "Where does your data
 * governance stand?" is phrased as a question, but its answer is an invitation
 * to fill in a form, and publishing that as an FAQ answer is the kind of thing
 * that gets a site's rich results pulled rather than shown.
 */
const extractFaq = (article) => {
  const lines = article.body.split('\n');
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^#{2,3}\s+(.*\?)\s*$/);
    if (!heading) continue;

    let sectionEnd = index + 1;
    while (sectionEnd < lines.length && !/^#{1,6}\s/.test(lines[sectionEnd])) sectionEnd += 1;
    const section = lines.slice(index + 1, sectionEnd);

    // The site writes every call to action as a link labelled with a trailing
    // arrow, which is the one reliable marker of promotional copy here. The
    // check covers the whole section, because the arrow usually sits a blank
    // line below the paragraph the answer would otherwise be built from.
    if (section.some((line) => /→\s*\]\(/.test(line))) continue;

    const answer = [];
    for (const line of section) {
      // Tables, images, and rules carry no sentence an answer can be built from.
      if (/^\s*(\||!\[|---|\*\*\*|___)/.test(line)) continue;
      if (line.trim()) answer.push(line.trim().replace(/^[*->\d.\s]+/, ''));
      else if (answer.length) break;
    }

    const text = answer.join(' ').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
    if (text.length < 80) continue;
    entries.push({
      '@type': 'Question',
      name: heading[1].replace(/[*_`]/g, '').trim(),
      acceptedAnswer: { '@type': 'Answer', text: text.slice(0, 1200) },
    });
  }
  return entries;
};

/**
 * @param article       the loaded article
 * @param canonical     its absolute URL
 * @param breadcrumb    [{ name, item }] for the breadcrumb trail
 * @param homeUrl       the homepage in the article's language
 * @param htmlLanguage  BCP 47 tag for the article's language
 */
export const renderArticleSchema = ({ article, canonical, breadcrumb, homeUrl, htmlLanguage, blogName }) => {
  const { about, mentions } = classifyTopics(article);
  const faq = extractFaq(article);
  const description = article.summary || article.title;

  const graph = [
    {
      '@type': 'BlogPosting',
      '@id': `${canonical}#article`,
      headline: article.title,
      name: article.title,
      description,
      datePublished: article.date,
      dateModified: article.date,
      inLanguage: htmlLanguage,
      articleSection: article.category,
      keywords: [article.category, ...about.map((thing) => thing.name)].filter(Boolean).join(', '),
      wordCount: article.body.trim().split(/\s+/).length,
      timeRequired: `PT${article.readingTime}M`,
      about,
      mentions,
      author: { '@id': `${SITE_ORIGIN}/#sandy-bradbury` },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      isPartOf: { '@id': `${SITE_ORIGIN}/${article.lang}/blog/#blog` },
      mainEntityOfPage: { '@id': canonical },
      image: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/assets/images/dg-logo.png`,
        caption: 'Data Governance Journey',
      },
      url: canonical,
    },
    {
      '@type': 'Blog',
      '@id': `${SITE_ORIGIN}/${article.lang}/blog/#blog`,
      name: blogName,
      url: `${SITE_ORIGIN}/${article.lang}/blog/`,
      inLanguage: htmlLanguage,
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    },
    // The homepage declares these entities in full; repeating the @id here is
    // what ties every article to the same author and publisher rather than
    // minting a new Person per page.
    {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#sandy-bradbury`,
      name: article.author,
      url: homeUrl,
      jobTitle: 'Data Governance Consultant',
      worksFor: { '@id': `${SITE_ORIGIN}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'Data Governance Journey',
      url: `${SITE_ORIGIN}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/assets/images/dg-logo.png` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumb.map((step, position) => ({
        '@type': 'ListItem',
        position: position + 1,
        name: step.name,
        item: step.item,
      })),
    },
  ];

  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      inLanguage: htmlLanguage,
      isPartOf: { '@id': canonical },
      mainEntity: faq,
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
};
