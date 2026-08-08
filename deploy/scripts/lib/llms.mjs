/**
 * Generates /llms.txt and /llms-full.txt.
 *
 * llms.txt is the convention for handing an assistant a map of a site in one
 * fetch: a short description of what the site is, then curated links with a line
 * of context each, so a model choosing what to read does not have to crawl and
 * guess. llms-full.txt is the same map with the article text inlined, for the
 * case where the assistant would rather read once than fetch twenty times.
 *
 * Both are built from the same article list as the sitemap, so a new article
 * appears in them the moment it is published — the previous hand-written
 * llms.txt listed no articles at all and had drifted out of date.
 */

const SITE_ORIGIN = 'https://datagovjourney.com';

const LANGUAGE_NAMES = { en: 'English', es: 'Español (Spanish)', pt: 'Português (Portuguese)' };

/** Non-article destinations worth pointing an assistant at, with why. */
const GUIDE_LINKS = {
  en: [
    ['Homepage', '/en/', 'Services, framework, and the full FAQ.'],
    ['Insights (blog index)', '/en/blog/', 'Every English article, newest first.'],
    ['Confession Wall', '/en/confession-wall/', 'Anonymous accounts of data-governance failures from practitioners.'],
    ['Data Governance Day-to-Day simulator', '/simulators/en/data-governance-day-to-day/', 'Branching scenario on the trade-offs a data governance lead makes in a week.'],
    ['Who Owns This? simulator', '/simulators/en/data-ownership-conflict/', 'Scenario on resolving a disputed data ownership claim between two departments.'],
    ['Data Literacy simulator', '/simulators/en/data-literacy/', 'Scenario on raising data literacy without a formal training budget.'],
  ],
  es: [
    ['Página principal', '/', 'Servicios, marco de trabajo y preguntas frecuentes completas.'],
    ['Ideas (índice del blog)', '/es/blog/', 'Todos los artículos en español, del más reciente al más antiguo.'],
    ['Muro de Confesiones', '/es/confession-wall/', 'Relatos anónimos de fracasos en gobierno de datos.'],
    ['Simulador del Día a Día', '/simulators/es/data-governance-day-to-day/', 'Escenario ramificado sobre las decisiones de un responsable de gobierno de datos.'],
    ['Simulador ¿Quién es el dueño de esto?', '/simulators/es/data-ownership-conflict/', 'Escenario sobre resolver una disputa de propiedad de datos entre áreas.'],
    ['Simulador de Alfabetización de Datos', '/simulators/es/data-literacy/', 'Escenario sobre elevar la alfabetización de datos sin presupuesto de formación.'],
  ],
  pt: [
    ['Página inicial', '/pt/', 'Serviços, framework e perguntas frequentes completas.'],
    ['Ideias (índice do blog)', '/pt/blog/', 'Todos os artigos em português, do mais recente ao mais antigo.'],
    ['Mural de Confissões', '/pt/confession-wall/', 'Relatos anônimos de fracassos em governança de dados.'],
    ['Simulador do Dia a Dia', '/simulators/pt/data-governance-day-to-day/', 'Cenário ramificado sobre as decisões de um responsável por governança de dados.'],
    ['Simulador Quem é o Dono Disso?', '/simulators/pt/data-ownership-conflict/', 'Cenário sobre resolver uma disputa de propriedade de dados entre áreas.'],
    ['Simulador de Alfabetização de Dados', '/simulators/pt/data-literacy/', 'Cenário sobre elevar a alfabetização de dados sem orçamento de treinamento.'],
  ],
};

/** Collapses a summary to a single line — llms.txt entries are one line each. */
const oneLine = (text) => text.replace(/\s+/g, ' ').trim();

const languageSection = (lang, articles) => {
  const lines = [`## ${LANGUAGE_NAMES[lang]}`, ''];
  for (const [label, route, note] of GUIDE_LINKS[lang]) {
    lines.push(`- [${label}](${SITE_ORIGIN}${route}): ${note}`);
  }
  lines.push('', `### Articles (${LANGUAGE_NAMES[lang]})`, '');
  for (const article of articles) {
    lines.push(
      `- [${oneLine(article.title)}](${SITE_ORIGIN}/${lang}/blog/${article.slug}/): ${article.date} · ${
        article.category
      } · ${oneLine(article.summary)}`
    );
  }
  lines.push('');
  return lines.join('\n');
};

const byLanguage = (articles, languages) =>
  languages.map((lang) => [
    lang,
    articles.filter((article) => article.lang === lang).sort((first, second) => second.date.localeCompare(first.date)),
  ]);

export const renderLlmsIndex = (intro, articles, languages) => {
  const sections = byLanguage(articles, languages).map(([lang, localized]) => languageSection(lang, localized));
  return `${intro.trim()}

Every article is published in all three languages; the versions are translations
of one another, not separate pieces. The full text of everything below is
available in one file at ${SITE_ORIGIN}/llms-full.txt.

${sections.join('\n')}`;
};

export const renderLlmsFull = (intro, articles, languages) => {
  const sections = byLanguage(articles, languages).map(([lang, localized]) => {
    const bodies = localized.map(
      (article) => `### ${oneLine(article.title)}

URL: ${SITE_ORIGIN}/${lang}/blog/${article.slug}/
Published: ${article.date}
Category: ${article.category}
Author: ${article.author}
Summary: ${oneLine(article.summary)}

${article.body}

---
`
    );
    return `## ${LANGUAGE_NAMES[lang]}\n\n${bodies.join('\n')}`;
  });

  return `${intro.trim()}

This file is the complete text of every article on the site, grouped by language
and newest first. A shorter link-only index is at ${SITE_ORIGIN}/llms.txt.

${sections.join('\n')}`;
};
