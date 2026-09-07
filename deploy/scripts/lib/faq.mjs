/**
 * The frequently asked questions, and the three places they are rendered.
 *
 * These twenty-seven answers -- nine in each language, four hundred words of
 * them -- lived as hand-written markup inside a section of the homepage. They
 * are the highest-intent text on the site ("what is the difference between a
 * data owner and a data steward" is a question people type into a search box),
 * they are the natural owner of FAQPage schema, and none of that was reachable
 * from anywhere except the middle of one long page.
 *
 * So they are data now, and one list feeds all three views: the page at
 * /<lang>/faq/, the four-question teaser that stays on the homepage, and the
 * FAQPage node in the page's schema. The schema and the visible answers cannot
 * drift apart, which is the thing Google penalises.
 */

import { escapeHtml } from './markdown.mjs';
import { NAV, pagePath } from './site-nav.mjs';

export const FAQ = {
  en: [
    {
      q: 'What is Data Governance according to the DAMA framework?',
      a:
        'According to DAMA, Data Governance is the exercise of authority and control over the management of data assets. It establishes policies, roles (Data Owners, Stewards), and rules to ensure data quality, security, and usability.',
    },
    {
      q: 'What is the difference between Data Governance and Data Management?',
      a:
        'Data Governance sets the strategy, policies, and decision rights (\'how to decide\'). Data Management executes those policies technically across database architecture, integration, and security (\'how to do\').',
    },
    {
      q: 'What is Data Literacy and why is it essential for organizations?',
      a:
        'Data Literacy is the ability of teams to read, analyze, and communicate with data effectively. It drives change management—ensuring employees adopt data-driven habits instead of relying on gut feelings.',
    },
    {
      q: 'What is a Data Governance MVP project?',
      a:
        'Instead of attempting enterprise-wide governance all at once, you pick one high-value business use case (e.g. Customer Domain or Executive Reporting) and govern it end to end, to prove immediate business value.',
    },
    {
      q: 'What is the difference between a Data Owner and a Data Steward?',
      a:
        'A Data Owner is a business leader with strategic authority and budget over a specific data domain (e.g., Customer or Finance). A Data Steward is an operational subject matter expert who manages daily data quality, enforces business rules, and maintains data definitions.',
    },
    {
      q: 'How do you measure the ROI of a Data Governance project?',
      a:
        'Data Governance ROI is measured by reducing operational costs (less time spent cleaning bad data or fixing reports), driving revenue (by enabling trusted analytics and AI models), and mitigating compliance risks, regulatory fines, and security breaches.',
    },
    {
      q: 'Do we need expensive software or tools to start Data Governance?',
      a:
        'No. Software is just an enabler. You can start Data Governance using existing enterprise tools by setting clear policies, RACI roles, and business glossaries first, proving business value before investing in enterprise governance platforms.',
    },
    {
      q: 'How does Data Governance support AI (Artificial Intelligence) implementation?',
      a:
        'AI is only as effective as the data feeding it ("Garbage in, Garbage out"). Data Governance ensures that data used for AI models, LLMs, and automated reporting is accurate, securely classified, compliant, and well-contextualized.',
    },
    {
      q: 'How long does a Data Governance implementation project take?',
      a:
        'A typical diagnostic and Minimum Viable Product (MVP) governance implementation takes between 8 to 12 weeks. This delivers quick wins on a priority use case before scaling the framework across the rest of the enterprise.',
    },
  ],
  es: [
    {
      q: '¿Qué es el Gobierno de Datos según la metodología DAMA?',
      a:
        'Según el marco internacional DAMA, el Gobierno de Datos es el ejercicio de autoridad y control sobre la gestión de los activos de datos. Establece las políticas, roles (Owners, Stewards) y procesos para garantizar la calidad, seguridad e integridad del dato.',
    },
    {
      q: '¿Cuál es la diferencia entre Gobierno de Datos y Gestión de Datos?',
      a:
        'El Gobierno de Datos define la estrategia, las reglas y los roles (\'saber cómo decidir\'). La Gestión de Datos ejecuta técnicamente esas reglas en la arquitectura, integración y almacenamiento (\'saber cómo hacer\'). Ambos se complementan.',
    },
    {
      q: '¿Qué es la Alfabetización en Datos (Data Literacy) y por qué es tan importante?',
      a:
        'La alfabetización en datos es la habilidad de las personas para entender, analizar y comunicarse con datos. Es el pilar del aculturamiento: de nada sirve la tecnología si los equipos no confían ni saben utilizar la información para tomar decisiones.',
    },
    {
      q: '¿En qué consiste un proyecto MVP (Mínimo Producto Viable) de Gobierno de Datos?',
      a:
        'En lugar de intentar gobernar toda la empresa desde el día uno, seleccionas un caso de uso estratégico (por ejemplo, el dominio de clientes o un informe financiero crítico) y aplicas gobierno de punta a punta para demostrar retorno de inversión rápido.',
    },
    {
      q: '¿Cuál es la diferencia entre un Data Owner y un Data Steward?',
      a:
        'El Data Owner (Dueño de Datos) es un líder de negocio con autoridad estratégica y presupuesto sobre un dominio de datos específico (ej. Clientes o Finanzas). El Data Steward (Custodio Funcional) es el experto operativo que aplica la calidad, define reglas de negocio y asegura el cumplimiento día a día.',
    },
    {
      q: '¿Cómo se mide el ROI de un proyecto de Gobierno de Datos?',
      a:
        'El ROI del Gobierno de Datos se mide reduciendo costes operativos (menos horas dedicadas a limpiar datos o corregir informes), aumentando ingresos (al habilitar analítica fiable e IA) y mitigando riesgos de seguridad, multas regulatorias o fugas de información.',
    },
    {
      q: '¿Necesitamos software o herramientas costosas para iniciar el Gobierno de Datos?',
      a:
        'No. La tecnología es solo el motor, pero la estrategia y las personas son la brújula y el corazón. Puedes iniciar Gobierno de Datos con herramientas existentes, estructurando la matriz RACI, las políticas y un catálogo inicial antes de invertir en software especializado.',
    },
    {
      q: '¿Cómo apoya el Gobierno de Datos la implementación de Inteligencia Artificial (IA)?',
      a:
        'La Inteligencia Artificial solo es tan buena como los datos que la alimentan ("Garbage in, Garbage out"). El Gobierno de Datos garantiza que los datos utilizados para entrenar o alimentar modelos de IA sean precisos, clasificados por privacidad y éticamente gestionados.',
    },
    {
      q: '¿Cuánto tiempo toma un proyecto de implementación de Gobierno de Datos?',
      a:
        'Un proyecto de diagnóstico e implementación de Mínimo Producto Viable (MVP) suele tomar entre 8 y 12 semanas. Esto permite entregar valor rápido en un caso de uso prioritario antes de escalar el marco gradualmente a toda la organización.',
    },
  ],
  pt: [
    {
      q: 'O que é Governança de Dados segundo a metodologia DAMA?',
      a:
        'Segundo o framework internacional DAMA, Governança de Dados é o exercício de autoridade e controle sobre a gestão dos ativos de dados. Estabelece políticas, papéis (Owners, Stewards) e regras para garantir qualidade e segurança.',
    },
    {
      q: 'Qual é a diferença entre Governança de Dados e Gestão de Dados?',
      a:
        'A Governança de Dados define a estratégia, políticas e regras (\'saber como decidir\'). A Gestão de Dados executa tecnicamente essas regras na arquitetura, integração e armazenamento (\'saber como fazer\').',
    },
    {
      q: 'O que é Alfabetização em Dados (Data Literacy)?',
      a:
        'A alfabetização em dados é a capacidade de ler, analisar e se comunicar com dados. É o pilar cultural que garante que as equipes saibam transformar informações em decisões reais de negócio.',
    },
    {
      q: 'O que é um projeto MVP de Governança de Dados?',
      a:
        'Em vez de governar toda a empresa de uma só vez, você seleciona um caso de uso crítico (como o domínio de clientes) e aplica governança de ponta a ponta para demonstrar valor imediato.',
    },
    {
      q: 'Qual é a diferença entre um Data Owner e um Data Steward?',
      a:
        'O Data Owner é um líder de negócio com autoridade estratégica sobre um domínio de dados (ex. Clientes ou Finanças). O Data Steward é o especialista operacional que aplica a qualidade, define regras de negócio e garante o cumprimento no dia a dia.',
    },
    {
      q: 'Como se mede o ROI de um projeto de Governança de Dados?',
      a:
        'O ROI da Governança de Dados é medido pela redução de custos operacionais (menos tempo a limpar dados incorretos), aumento de receitas (ao viabilizar analítica e IA confiáveis) e mitigação de riscos de conformidade e segurança.',
    },
    {
      q: 'Precisamos de software ou ferramentas caras para iniciar a Governança de Dados?',
      a:
        'Não. O software é apenas um viabilizador. Pode iniciar a Governança de Dados com ferramentas existentes, definindo papéis RACI, políticas e glossários de negócio antes de investir em plataformas de software complexas.',
    },
    {
      q: 'Como a Governança de Dados apoia a implementação de Inteligência Artificial (IA)?',
      a:
        'A Inteligência Artificial é tão boa quanto os dados que a alimentam. A Governança de Dados garante que os dados usados para modelos de IA e analítica sejam precisos, seguros, classificados e alinhados com regras de privacidade.',
    },
    {
      q: 'Quanto tempo demora um projeto de implementação de Governança de Dados?',
      a:
        'Um projeto de diagnóstico e implementação de um Mínimo Produto Viável (MVP) demora habitualmente entre 8 e 12 semanas, entregando valor rápido num caso de uso prioritário antes de expandir a governança a toda a organização.',
    },
  ],
};

/**
 * Which four the homepage keeps.
 *
 * The homepage's job is to convince, not to answer everything: what the
 * practice is, how it differs from data management, what it returns, and how
 * long it takes. The rest are one click away, where they can rank on their own.
 */
const HOME_TEASER = [0, 1, 5, 8];

const COPY = {
  en: {
    seeAll: 'See all nine questions',
    intro: 'Nine questions I am asked in almost every first conversation, answered directly.',
  },
  es: {
    seeAll: 'Ver las nueve preguntas',
    intro:
      'Nueve preguntas que me hacen en casi toda primera conversación, respondidas sin rodeos.',
  },
  pt: {
    seeAll: 'Ver as nove perguntas',
    intro:
      'Nove perguntas que me fazem em quase toda primeira conversa, respondidas sem rodeios.',
  },
};

/**
 * The homepage teaser, in the homepage's own accordion styling.
 *
 * `name="faq"` makes the group exclusive: opening one closes the others, so the
 * section never grows tall enough to push the contact form off the screen.
 */
export const renderHomeFaq = (lang) => {
  const items = HOME_TEASER.map((index) => FAQ[lang][index])
    .map(
      (item) => `                <details name="faq" class="faq-item bg-white border border-slate-200 rounded-2xl p-6 transition-all">
                    <summary class="flex items-center justify-between gap-5 cursor-pointer text-deepblue font-extrabold">
                        <span>${escapeHtml(item.q)}</span>
                    </summary>
                    <p class="mt-4 pr-10 text-sm text-slate-600 leading-relaxed">${escapeHtml(item.a)}</p>
                </details>`
    )
    .join('\n\n');

  return `<div class="space-y-4">
${items}
            </div>
            <p class="mt-8 text-center">
                <a href="${pagePath(lang, 'faq')}" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-deepblue text-white text-sm font-bold hover:bg-deepblue/90 transition-all">${escapeHtml(
                  COPY[lang].seeAll
                )}<i class="fa-solid fa-arrow-right text-emeraldgreen" aria-hidden="true"></i></a>
            </p>`;
};

/** The full accordion, rendered into the {{FAQ}} token on the FAQ page. */
export const renderFaqSection = (lang) => {
  const items = FAQ[lang]
    .map(
      (item, index) => `        <details class="page-faq__item"${index === 0 ? ' open' : ''}>
          <summary class="page-faq__question">${escapeHtml(item.q)}</summary>
          <div class="page-faq__answer"><p>${escapeHtml(item.a)}</p></div>
        </details>`
    )
    .join('\n');

  // Not exclusive here, unlike the homepage teaser: somebody who came to read
  // the answers should be able to leave several open and compare them.
  return `    <div class="page-section blog-shell">
      <div class="page-faq">
${items}
      </div>
    </div>`;
};

/**
 * The FAQPage node.
 *
 * The homepage used to carry this, one node per language, which claimed that
 * the homepage was the page answering the questions. It is on the FAQ page now,
 * where the answers actually are and where a rich result would send a reader
 * somewhere that answers them.
 */
export const faqSchema = (lang, canonical) => ({
  '@type': 'FAQPage',
  '@id': `${canonical}#faq`,
  url: canonical,
  inLanguage: lang,
  name: NAV[lang].faq,
  description: COPY[lang].intro,
  isPartOf: { '@id': 'https://datagovjourney.com/#website' },
  mainEntity: FAQ[lang].map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});
