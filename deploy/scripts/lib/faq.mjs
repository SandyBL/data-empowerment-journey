/**
 * The frequently asked questions, and the three places they are rendered.
 *
 * These twenty-seven answers -- nine in each language -- lived as hand-written
 * markup inside a section of the homepage. They are the highest-intent text on
 * the site ("what is the difference between a data owner and a data steward" is
 * a question people type into a search box), they are the natural owner of
 * FAQPage schema, and none of that was reachable from anywhere except the
 * middle of one long page.
 *
 * So they are data now, and one list feeds all three views: the page at
 * /<lang>/faq/, the four-question teaser that stays on the homepage, and the
 * FAQPage node in the page's schema. The schema and the visible answers cannot
 * drift apart, which is the thing Google penalises.
 *
 * The questions are worded the way people search and the answers are worded the
 * way they get given on a call, which is not the same voice. "Data Governance is
 * the exercise of authority and control over the management of data assets" is
 * what the first answer used to open with -- true, quotable, and nobody has ever
 * said it out loud to a sceptical CFO. The answers now say the thing first and
 * name the framework second, in the same second-person register as the homepage,
 * because the reader arriving here is deciding whether this is worth their
 * afternoon rather than revising for an exam.
 */

import { escapeHtml } from './markdown.mjs';
import { NAV, pagePath } from './site-nav.mjs';

export const FAQ = {
  en: [
    {
      q: 'What is Data Governance according to the DAMA framework?',
      a:
        'DAMA calls it the exercise of authority and control over the management of data assets, which is precise and lands badly in a meeting. What it means day to day is deciding who decides: who owns a definition, who approves access, who is accountable when a number turns out to be wrong. Policies, roles and rules are how those decisions get written down so they still hold six months after the meeting.',
    },
    {
      q: 'What is the difference between Data Governance and Data Management?',
      a:
        'Governance decides, management builds. Governance sets the strategy, the policies and the decision rights: who owns the customer definition, who approves access, what quality level is good enough. Data management is the technical work that carries those decisions out across architecture, integration and security. You need both. One without the other is either a policy nobody implements or a platform nobody agrees on.',
    },
    {
      q: 'What is Data Literacy and why is it essential for organizations?',
      a:
        'Data literacy is your teams being able to read a number, question it and act on it. It is the difference between a dashboard people cite and a dashboard people trust. And it is usually a vocabulary problem rather than a numeracy one: people are rarely bad at reading a chart, they are unsure whether "active customer" means the same thing on your slide as it does in their report.',
    },
    {
      q: 'What is a Data Governance MVP project?',
      a:
        'Rather than govern the whole enterprise at once, you pick one use case that already hurts, such as the customer domain or the board report, and you govern it end to end: owner named, definitions agreed, quality measured, access controlled. You get something working in weeks instead of a framework document in months, and your sponsor gets a result they can see.',
    },
    {
      q: 'What is the difference between a Data Owner and a Data Steward?',
      a:
        'The data owner is a business leader who can actually change things: authority and budget over a domain such as Customer or Finance, and the consequence when a call goes wrong. The data steward is the person who does the work, maintaining definitions, chasing quality issues, applying business rules and answering what a field means. An owner without a steward is accountability with no capacity; a steward without an owner is work with no mandate.',
    },
    {
      q: 'How do you measure the ROI of a Data Governance project?',
      a:
        'In three places, and you can usually count all three. Cost: the hours your people spend cleaning data, reconciling reports and rebuilding numbers nobody trusts. Revenue: the analytics and AI models you can act on because what feeds them is dependable. Risk: the fines, breaches and audit findings you did not have. If you want a figure to open the conversation with, put your own rework hours into the cost of bad data calculator on this site.',
    },
    {
      q: 'Do we need expensive software or tools to start Data Governance?',
      a:
        'No. Tools help; they do not decide anything. You can start with what you already own: a spreadsheet for the glossary, a RACI for the roles, a written rule for classification and access. Buy the platform once you know what you want it to do, because a catalog full of definitions nobody has agreed on is an expensive list of table names.',
    },
    {
      q: 'How does Data Governance support AI (Artificial Intelligence) implementation?',
      a:
        'Almost every AI problem I get called into turns out to be a data problem: nobody can say where the training data came from, who approved its use, whether it holds personal records, or why the model answered the way it did. Governance is what answers those questions, through lineage, classification, access control and retention. That is why the organizations that governed their data first are the ones whose AI work survives contact with a regulator.',
    },
    {
      q: 'How long does a Data Governance implementation project take?',
      a:
        'A diagnostic plus a first governed use case usually runs 8 to 12 weeks: a few weeks to see clearly where it hurts, the rest to fix one thing end to end. What you have at the end is not a finished program. It is a working example and a plan the organization believes, which is what you need before taking on the next domain.',
    },
  ],
  es: [
    {
      q: '¿Qué es el Gobierno de Datos según la metodología DAMA?',
      a:
        'DAMA lo llama el ejercicio de autoridad y control sobre la gestión de los activos de datos, que es preciso y funciona mal en una reunión. En el día a día significa decidir quién decide: quién es dueño de una definición, quién aprueba un acceso, quién responde cuando un número sale mal. Las políticas, los roles y las reglas son la forma de dejar esas decisiones por escrito para que sigan en pie seis meses después.',
    },
    {
      q: '¿Cuál es la diferencia entre Gobierno de Datos y Gestión de Datos?',
      a:
        'El gobierno decide, la gestión construye. El gobierno fija la estrategia, las políticas y los derechos de decisión: quién es dueño de la definición de cliente, quién aprueba los accesos, qué nivel de calidad es suficiente. La gestión de datos es el trabajo técnico que ejecuta esas decisiones en la arquitectura, la integración y la seguridad. Necesitas los dos: uno sin el otro es una política que nadie implementa o una plataforma sobre la que nadie se pone de acuerdo.',
    },
    {
      q: '¿Qué es la Alfabetización en Datos (Data Literacy) y por qué es tan importante?',
      a:
        'La alfabetización en datos es que tus equipos sepan leer un número, cuestionarlo y actuar con él. Es la diferencia entre un tablero que la gente cita y un tablero en el que la gente confía. Y casi siempre es un problema de vocabulario y no de estadística: la gente rara vez lee mal un gráfico, lo que no sabe es si "cliente activo" significa lo mismo en tu presentación que en su informe.',
    },
    {
      q: '¿En qué consiste un proyecto MVP (Mínimo Producto Viable) de Gobierno de Datos?',
      a:
        'En lugar de gobernar toda la empresa de golpe, eliges un caso de uso que ya duele —el dominio de clientes, el informe del comité— y lo gobiernas de punta a punta: dueño nombrado, definiciones acordadas, calidad medida, accesos controlados. Tienes algo funcionando en semanas en vez de un documento de marco en meses, y tu patrocinador tiene un resultado que puede ver.',
    },
    {
      q: '¿Cuál es la diferencia entre un Data Owner y un Data Steward?',
      a:
        'El Data Owner es un líder de negocio que puede cambiar las cosas de verdad: tiene autoridad y presupuesto sobre un dominio como Clientes o Finanzas, y se come la consecuencia cuando una decisión sale mal. El Data Steward es quien hace el trabajo: mantiene las definiciones, persigue los problemas de calidad, aplica las reglas de negocio y responde qué significa un campo. Un dueño sin custodio es responsabilidad sin capacidad; un custodio sin dueño es trabajo sin mandato.',
    },
    {
      q: '¿Cómo se mide el ROI de un proyecto de Gobierno de Datos?',
      a:
        'En tres sitios, y normalmente los tres se pueden contar. Coste: las horas que tu gente dedica a limpiar datos, conciliar informes y reconstruir cifras de las que nadie se fía. Ingreso: la analítica y los modelos de IA sobre los que puedes actuar porque lo que los alimenta es fiable. Riesgo: las multas, las fugas y los hallazgos de auditoría que no tuviste. Si quieres una cifra con la que abrir la conversación, mete tus horas de retrabajo en la calculadora del coste de los datos malos de este sitio.',
    },
    {
      q: '¿Necesitamos software o herramientas costosas para iniciar el Gobierno de Datos?',
      a:
        'No. Las herramientas ayudan; no deciden nada. Puedes empezar con lo que ya tienes: una hoja de cálculo para el glosario, una matriz RACI para los roles, una regla escrita para clasificación y accesos. Compra la plataforma cuando sepas qué quieres que haga, porque un catálogo lleno de definiciones que nadie ha acordado es una lista carísima de nombres de tablas.',
    },
    {
      q: '¿Cómo apoya el Gobierno de Datos la implementación de Inteligencia Artificial (IA)?',
      a:
        'Casi todos los problemas de IA a los que me llaman resultan ser problemas de datos: nadie puede decir de dónde salió el dato de entrenamiento, quién autorizó su uso, si contiene registros personales o por qué el modelo respondió lo que respondió. El gobierno de datos es lo que responde a eso, con linaje, clasificación, control de acceso y retención. Por eso las organizaciones que gobernaron sus datos antes son las que aguantan cuando un regulador pregunta.',
    },
    {
      q: '¿Cuánto tiempo toma un proyecto de implementación de Gobierno de Datos?',
      a:
        'Un diagnóstico más un primer caso de uso gobernado suele llevar entre 8 y 12 semanas: unas semanas para ver con claridad dónde duele y el resto para arreglar una cosa de punta a punta. Lo que tienes al final no es un programa terminado. Es un ejemplo que funciona y un plan que la organización se cree, que es lo que hace falta antes de ir al siguiente dominio.',
    },
  ],
  pt: [
    {
      q: 'O que é Governança de Dados segundo a metodologia DAMA?',
      a:
        'A DAMA chama de exercício de autoridade e controle sobre a gestão dos ativos de dados, o que é preciso e funciona mal numa reunião. No dia a dia significa decidir quem decide: quem é dono de uma definição, quem aprova um acesso, quem responde quando um número sai errado. Políticas, papéis e regras são a forma de deixar essas decisões escritas para que continuem valendo seis meses depois.',
    },
    {
      q: 'Qual é a diferença entre Governança de Dados e Gestão de Dados?',
      a:
        'A governança decide, a gestão constrói. A governança define a estratégia, as políticas e os direitos de decisão: quem é dono da definição de cliente, quem aprova acessos, qual nível de qualidade é suficiente. A gestão de dados é o trabalho técnico que executa essas decisões na arquitetura, na integração e na segurança. Você precisa das duas: uma sem a outra é uma política que ninguém implementa ou uma plataforma sobre a qual ninguém concorda.',
    },
    {
      q: 'O que é Alfabetização em Dados (Data Literacy)?',
      a:
        'Alfabetização em dados é a sua equipe conseguir ler um número, questioná-lo e agir com ele. É a diferença entre um painel que as pessoas citam e um painel em que as pessoas confiam. E quase sempre é um problema de vocabulário, não de estatística: as pessoas raramente leem um gráfico errado, elas não sabem se "cliente ativo" significa a mesma coisa na sua apresentação e no relatório delas.',
    },
    {
      q: 'O que é um projeto MVP de Governança de Dados?',
      a:
        'Em vez de governar a empresa inteira de uma vez, você escolhe um caso de uso que já dói — o domínio de clientes, o relatório do comitê — e governa de ponta a ponta: dono nomeado, definições acordadas, qualidade medida, acessos controlados. Você tem algo funcionando em semanas em vez de um documento de framework em meses, e o seu patrocinador tem um resultado que ele consegue ver.',
    },
    {
      q: 'Qual é a diferença entre um Data Owner e um Data Steward?',
      a:
        'O Data Owner é um líder de negócio que pode mudar as coisas de verdade: tem autoridade e orçamento sobre um domínio como Clientes ou Finanças, e leva a consequência quando uma decisão sai errada. O Data Steward é quem faz o trabalho: mantém as definições, persegue os problemas de qualidade, aplica as regras de negócio e responde o que significa cada campo. Um dono sem steward é responsabilidade sem capacidade; um steward sem dono é trabalho sem mandato.',
    },
    {
      q: 'Como se mede o ROI de um projeto de Governança de Dados?',
      a:
        'Em três lugares, e normalmente dá para contar os três. Custo: as horas que a sua equipe gasta limpando dados, conciliando relatórios e refazendo números em que ninguém confia. Receita: a analítica e os modelos de IA sobre os quais você pode agir porque o que os alimenta é confiável. Risco: as multas, os vazamentos e os apontamentos de auditoria que você não teve. Se quiser um número para abrir a conversa, jogue as suas horas de retrabalho na calculadora do custo dos dados ruins deste site.',
    },
    {
      q: 'Precisamos de software ou ferramentas caras para iniciar a Governança de Dados?',
      a:
        'Não. As ferramentas ajudam; elas não decidem nada. Você pode começar com o que já tem: uma planilha para o glossário, uma matriz RACI para os papéis, uma regra escrita para classificação e acesso. Compre a plataforma quando souber o que quer que ela faça, porque um catálogo cheio de definições que ninguém acordou é uma lista carríssima de nomes de tabelas.',
    },
    {
      q: 'Como a Governança de Dados apoia a implementação de Inteligência Artificial (IA)?',
      a:
        'Quase todo problema de IA para o qual me chamam acaba sendo um problema de dados: ninguém sabe dizer de onde veio o dado de treinamento, quem autorizou o uso, se ele contém registros pessoais ou por que o modelo respondeu o que respondeu. A governança é o que responde a isso, com linhagem, classificação, controle de acesso e retenção. É por isso que as organizações que governaram os dados primeiro são as que se sustentam quando um regulador pergunta.',
    },
    {
      q: 'Quanto tempo demora um projeto de implementação de Governança de Dados?',
      a:
        'Um diagnóstico mais um primeiro caso de uso governado costuma levar de 8 a 12 semanas: algumas semanas para ver com clareza onde dói e o resto para consertar uma coisa de ponta a ponta. O que você tem no fim não é um programa pronto. É um exemplo que funciona e um plano em que a organização acredita, que é o que falta antes de partir para o próximo domínio.',
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
