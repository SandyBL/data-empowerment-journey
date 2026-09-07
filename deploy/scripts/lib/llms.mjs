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

import { articlePath, glossaryTermPath } from './routes.mjs';

const SITE_ORIGIN = 'https://datagovjourney.com';

const LANGUAGE_NAMES = { en: 'English', es: 'Español (Spanish)', pt: 'Português (Portuguese)' };

/** Non-article destinations worth pointing an assistant at, with why. */
const GUIDE_LINKS = {
  en: [
    ['Homepage', '/en/', 'Services, the three-pillar framework, and the four most common questions.'],
    ['FAQ', '/en/faq/', 'Nine data governance questions answered directly: the DAMA definition, governance versus data management, data owner versus data steward, ROI, tooling, AI readiness and realistic timelines.'],
    ['Insights (blog index)', '/en/blog/', 'Every English article, newest first.'],
    ['Glossary', '/en/glossary/', 'Definitions of the working vocabulary, grouped by theme; every term also has its own page at /en/glossary/<term>/.'],
    ['RSS feed', '/en/feed.xml', 'The English articles as RSS 2.0.'],
    ['Confession Wall', '/en/confession-wall/', 'Anonymous accounts of data-governance failures from practitioners.'],
    ['About Sandy Bradbury', '/en/about/', 'Who writes this: background, DAMA certifications, and how the practice works.'],
    ['Advisory', '/en/advisory/', 'Two ways to get help: a paid 30-minute session on one governance problem, requested in writing rather than booked from a calendar; and four shapes of longer work — diagnostic, operating model design, data catalog practice, monthly block of hours — with what each produces and what is explicitly not offered.'],
    ['Workshops', '/en/workshops/', 'Facilitated governance sessions run on private, client-branded copies of the simulators, with a facilitator report afterwards.'],
    ['Free resources', '/en/resources/', 'Index of every free tool, template and playbook. Nothing is behind an email form.'],
    ['Cost of bad data calculator', '/en/calculator/', 'Estimates the annual cost of current data problems, and explains how to defend the number.'],
    ['Maturity assessment', '/en/maturity-assessment/', 'DAMA-based scorecard returning a level, a five-axis radar and three quick wins.'],
    ['Template library', '/en/templates/', 'Six Excel and Word working files: pain points, 5W2H framing, evolution stages, catalog use cases, principles and policies, governance scorecard.'],
    ['Playbooks', '/en/playbooks/', 'PDF playbooks on standing up data governance and on AI governance.'],
    ['Data Governance Day-to-Day simulator', '/simulators/en/data-governance-day-to-day/', 'Branching scenario on the trade-offs a data governance lead makes in a week.'],
    ['Who Owns This? simulator', '/simulators/en/data-ownership-conflict/', 'Scenario on resolving a disputed data ownership claim between two departments.'],
    ['Data Literacy simulator', '/simulators/en/data-literacy/', 'Scenario on raising data literacy without a formal training budget.'],
    ['Public simulator results', '/en/simulator-results/', 'What the three public leaderboards currently show, with the sample size stated, plus the lessons that come out of them and an explanation of what a public board cannot measure.'],
  ],
  es: [
    ['Página principal', '/', 'Servicios, el marco de tres pilares y las cuatro preguntas más frecuentes.'],
    ['Preguntas frecuentes', '/es/preguntas-frecuentes/', 'Nueve preguntas de gobierno de datos respondidas directamente: la definición DAMA, gobierno frente a gestión, data owner frente a data steward, ROI, herramientas, IA y plazos realistas.'],
    ['Ideas (índice del blog)', '/es/blog/', 'Todos los artículos en español, del más reciente al más antiguo.'],
    ['Glosario', '/es/glosario/', 'Definiciones del vocabulario de trabajo, agrupadas por tema; cada término tiene además su propia página en /es/glosario/<término>/.'],
    ['Feed RSS', '/es/feed.xml', 'Los artículos en español como RSS 2.0.'],
    ['Muro de Confesiones', '/es/muro-de-confesiones/', 'Relatos anónimos de fracasos en gobierno de datos.'],
    ['Sobre Sandy Bradbury', '/es/sobre/', 'Quién escribe esto: trayectoria, certificaciones DAMA y cómo trabaja la práctica.'],
    ['Asesoría', '/es/asesoria/', 'Dos formas de recibir ayuda: una sesión de pago de 30 minutos sobre un problema de gobierno, solicitada por escrito en lugar de agendada desde un calendario; y cuatro formatos de proyecto más largo —diagnóstico, diseño del modelo operativo, práctica de catálogo de datos, bloque mensual de horas— con lo que produce cada uno y lo que no se ofrece.'],
    ['Talleres', '/es/talleres/', 'Sesiones facilitadas de gobierno sobre copias privadas de los simuladores con la marca del cliente, con informe para el facilitador.'],
    ['Recursos gratuitos', '/es/recursos/', 'Índice de todas las herramientas, plantillas y playbooks gratuitos. Nada detrás de un formulario.'],
    ['Calculadora del coste de los datos malos', '/es/calculadora/', 'Estima el coste anual de los problemas de datos actuales y explica cómo defender la cifra.'],
    ['Diagnóstico de madurez', '/es/diagnostico-de-madurez/', 'Scorecard basado en DAMA que devuelve un nivel, un radar de cinco ejes y tres quick wins.'],
    ['Biblioteca de plantillas', '/es/plantillas/', 'Seis ficheros de trabajo en Excel y Word: puntos de dolor, encuadre 5W2H, etapas de evolución, casos de uso de catálogo, principios y políticas, scorecard de gobierno.'],
    ['Playbooks', '/es/playbooks/', 'Playbooks en PDF sobre poner en marcha el gobierno de datos y sobre gobierno de la IA.'],
    ['Simulador del Día a Día', '/simulators/es/data-governance-day-to-day/', 'Escenario ramificado sobre las decisiones de un responsable de gobierno de datos.'],
    ['Simulador ¿Quién es el dueño de esto?', '/simulators/es/data-ownership-conflict/', 'Escenario sobre resolver una disputa de propiedad de datos entre áreas.'],
    ['Simulador de Alfabetización de Datos', '/simulators/es/data-literacy/', 'Escenario sobre elevar la alfabetización de datos sin presupuesto de formación.'],
    ['Resultados públicos de los simuladores', '/es/resultados-de-simuladores/', 'Lo que muestran ahora las tres clasificaciones públicas, con el tamaño de muestra declarado, más las lecciones que salen de ellas y qué no puede medir una clasificación pública.'],
  ],
  pt: [
    ['Página inicial', '/pt/', 'Serviços, o framework de três pilares e as quatro perguntas mais frequentes.'],
    ['Perguntas frequentes', '/pt/perguntas-frequentes/', 'Nove perguntas de governança de dados respondidas diretamente: a definição da DAMA, governança versus gestão, data owner versus data steward, ROI, ferramentas, IA e prazos realistas.'],
    ['Ideias (índice do blog)', '/pt/blog/', 'Todos os artigos em português, do mais recente ao mais antigo.'],
    ['Glossário', '/pt/glossario/', 'Definições do vocabulário de trabalho, agrupadas por tema; cada termo também tem a sua própria página em /pt/glossario/<termo>/.'],
    ['Feed RSS', '/pt/feed.xml', 'Os artigos em português como RSS 2.0.'],
    ['Mural de Confissões', '/pt/mural-de-confissoes/', 'Relatos anônimos de fracassos em governança de dados.'],
    ['Sobre Sandy Bradbury', '/pt/sobre/', 'Quem escreve isto: trajetória, certificações DAMA e como a prática funciona.'],
    ['Assessoria', '/pt/assessoria/', 'Duas formas de receber ajuda: uma sessão paga de 30 minutos sobre um problema de governança, solicitada por escrito em vez de agendada por calendário; e quatro formatos de projeto mais longo — diagnóstico, desenho do modelo operacional, prática de catálogo de dados, bloco mensal de horas — com o que cada um produz e o que não é oferecido.'],
    ['Workshops', '/pt/workshops/', 'Sessões facilitadas de governança sobre cópias privadas dos simuladores com a marca do cliente, com relatório para o facilitador.'],
    ['Recursos gratuitos', '/pt/recursos/', 'Índice de todas as ferramentas, modelos e playbooks gratuitos. Nada atrás de um formulário.'],
    ['Calculadora do custo dos dados ruins', '/pt/calculadora/', 'Estima o custo anual dos problemas de dados atuais e explica como defender o número.'],
    ['Diagnóstico de maturidade', '/pt/diagnostico-de-maturidade/', 'Scorecard baseado na DAMA que devolve um nível, um radar de cinco eixos e três quick wins.'],
    ['Biblioteca de modelos', '/pt/modelos/', 'Seis arquivos de trabalho em Excel e Word: pontos de dor, enquadramento 5W2H, etapas de evolução, casos de uso de catálogo, princípios e políticas, scorecard de governança.'],
    ['Playbooks', '/pt/playbooks/', 'Playbooks em PDF sobre colocar a governança de dados em pé e sobre governança de IA.'],
    ['Simulador do Dia a Dia', '/simulators/pt/data-governance-day-to-day/', 'Cenário ramificado sobre as decisões de um responsável por governança de dados.'],
    ['Simulador Quem é o Dono Disso?', '/simulators/pt/data-ownership-conflict/', 'Cenário sobre resolver uma disputa de propriedade de dados entre áreas.'],
    ['Simulador de Alfabetização de Dados', '/simulators/pt/data-literacy/', 'Cenário sobre elevar a alfabetização de dados sem orçamento de treinamento.'],
    ['Resultados públicos dos simuladores', '/pt/resultados-dos-simuladores/', 'O que os três rankings públicos mostram agora, com o tamanho da amostra declarado, mais as lições que saem deles e o que um ranking público não consegue medir.'],
  ],
};

/** The heading each language's glossary section gets in llms.txt. */
const GLOSSARY_HEADINGS = { en: 'Glossary', es: 'Glosario', pt: 'Glossário' };

/** Collapses a summary to a single line — llms.txt entries are one line each. */
const oneLine = (text) => text.replace(/\s+/g, ' ').trim();

const languageSection = (lang, articles, terms) => {
  const lines = [`## ${LANGUAGE_NAMES[lang]}`, ''];
  for (const [label, route, note] of GUIDE_LINKS[lang]) {
    lines.push(`- [${label}](${SITE_ORIGIN}${route}): ${note}`);
  }
  lines.push('', `### Articles (${LANGUAGE_NAMES[lang]})`, '');
  for (const article of articles) {
    lines.push(
      `- [${oneLine(article.title)}](${SITE_ORIGIN}${articlePath(lang, article.slug)}): ${article.date} · ${
        article.category
      } · ${oneLine(article.summary)}`
    );
  }
  // The definitions are inlined rather than left behind their links. An
  // assistant asked "what is a data steward" can answer from this file in one
  // fetch instead of thirty-three, and the one-line definition is the whole
  // useful payload of a term page.
  if (terms.length) {
    lines.push('', `### ${GLOSSARY_HEADINGS[lang]} (${LANGUAGE_NAMES[lang]})`, '');
    for (const term of terms) {
      lines.push(
        `- [${oneLine(term.term)}](${SITE_ORIGIN}${glossaryTermPath(lang, term.slug)}): ${oneLine(term.short)}`
      );
    }
  }
  lines.push('');
  return lines.join('\n');
};

const byLanguage = (articles, languages) =>
  languages.map((lang) => [
    lang,
    articles.filter((article) => article.lang === lang).sort((first, second) => second.date.localeCompare(first.date)),
  ]);

export const renderLlmsIndex = (intro, articles, languages, terms = []) => {
  const byTerm = (first, second) => first.term.localeCompare(second.term, 'en');
  const sections = byLanguage(articles, languages).map(([lang, localized]) =>
    languageSection(
      lang,
      localized,
      terms.filter((term) => term.lang === lang).sort(byTerm)
    )
  );
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

URL: ${SITE_ORIGIN}${articlePath(lang, article.slug)}
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
