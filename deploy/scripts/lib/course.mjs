/**
 * The Portuguese course: the curriculum, the offer, and the blocks the page at
 * /pt/curso-governanca-de-dados/ is built from.
 *
 * This is the only thing on the site that exists in one language. The course is
 * taught in Portuguese, so there is no English or Spanish product to sell and
 * therefore no page to publish, no hreflang sibling to declare and no menu item
 * to add in those languages. The build already handles that shape without being
 * told: `course` is a key in PAGE_SLUGS.pt and in neither of the other two, so
 * the hreflang cluster collapses to a single self-referencing entry,
 * writeSitePages only ever publishes the Portuguese directory, and the sweep
 * that retires unrecognised directories never sees an English one to keep.
 *
 * Why the blocks are rendered here rather than lifted from src/partials/: a
 * token that names a file in src/partials is, by construction, a page that
 * loads assets/styles.css (see EMBEDS_HOME_MARKUP in ./site-pages.mjs), and
 * that stylesheet carries `h1, h2, h3, p { margin: 0 }`. A sales page is mostly
 * prose, and prose with no margins does not sell anything. So the markup lives
 * in code, the CSS lives in assets/css/pages.css, and the page stays on the
 * blog's typography -- the same arrangement ./board-summary.mjs uses and for
 * the same reason.
 *
 * Two numbers on the page are counted out of src/partials/template-library.html
 * at build time rather than typed here. The single strongest argument for
 * buying is the eighteen templates that library names and deliberately does not
 * link, and a sales page claiming "18" three months after someone publishes a
 * nineteenth is a page that lies about the only thing it is selling. Counting
 * them makes that impossible; see renderCourseTemplates.
 *
 * The discount is carried in the checkout URL as `offDiscount` -- Hotmart's own
 * parameter for a pre-applied coupon -- as well as printed on the page. Printed
 * alone it is a code to retype on a phone keyboard, where autofill adds a
 * trailing space and the checkout rejects it; in the link it is already applied
 * when the page loads. Printed as well because a buyer who sees half price at
 * the checkout and no explanation assumes the page was wrong.
 *
 * There is no countdown and no seat counter. The scarcity is real -- the coupon
 * is limited to ten uses in Hotmart -- and a timer that resets on reload would
 * be the one claim on this site that the site itself can prove false.
 */

import { escapeHtml } from './markdown.mjs';
import { SITE_ORIGIN } from './brand.mjs';
import { pagePath } from './site-nav.mjs';

/**
 * Everything about the product that a human might need to change, in one place.
 *
 * The price is the list price in reais, which is what the page shows and what
 * the Offer node declares. Hotmart converts it for the buyer's country at the
 * checkout, so the page says so rather than pretending the number is universal:
 * a page promising R$ 99 to a reader whose checkout opens at $22 has broken
 * trust before the first video.
 */
export const COURSE = {
  name: 'Como Implantar Governança de Dados com Sucesso',
  checkoutUrl: 'https://pay.hotmart.com/T107402631R',
  coupon: 'PRIMEIROS10',
  couponSeats: 10,
  couponPercent: 50,
  price: 99,
  currency: 'BRL',
  refundDays: 7,
  sections: [
    {
      icon: '🧭',
      title: 'A Bússola: Fundamentos da Governança de Dados na prática',
      summary:
        'É no começo que a maioria dos programas morre. Esta seção termina com um projeto descrito em uma página, uma linha de base medida, uma primeira política curta o bastante para ser lida, um comitê com mandato de verdade e os domínios de dados repartidos entre áreas que aceitaram ficar com eles.',
      lessons: [
        'Introdução à Governança de Dados na prática',
        'Como usar o 5W2H Canvas para estruturar um projeto de Governança de Dados em uma única página',
        'Defina a Linha de Base com uma Avaliação de Maturidade em Gestão de Dados (DMMA)',
        'Criando sua Primeira Política de Governança de Dados',
        'Como Formar o Comitê de Governança de Dados',
        'Como Classificar e Calcular a Criticidade dos Dados e Por que isso é importante',
        'Como Definir os Domínios de Dados e Engajar as Áreas de Negócio',
      ],
    },
    {
      icon: '⚙️',
      title: 'O Motor: Como operacionalizar os Fundamentos de Governança de Dados',
      summary:
        'A parte que separa um framework aprovado de um programa que funciona. Metadados e catálogo, segurança e privacidade, qualidade medida com DMAIC e a disciplina do "fit for purpose" — mais as engrenagens que ninguém avisa que existem até você tropeçar nelas.',
      lessons: [
        'Da Teoria à Ação: Operacionalizando Metadados, Qualidade e Segurança',
        'Metadados e Catálogo: O GPS do Ecossistema de Dados',
        'Segurança de Dados e Privacidade: Protegendo com Inteligência',
        'Qualidade de Dados: O Método DMAIC e a Prática do "Fit for Purpose"',
        'As Engrenagens Ocultas da Operacionalização',
      ],
    },
    {
      icon: '❤️',
      title: 'O Coração: Cultura de Dados e Literacia',
      summary:
        'Nenhuma política sobrevive a uma organização que não quer aplicá-la. Gestão de mudanças, engajamento, o papel da comunicação, do RH e dos incentivos, e alfabetização em dados como a condição para qualquer coisa parecida com uma cultura data-driven.',
      lessons: [
        'O Fator Humano: Por que a Governança é uma Jornada de Pessoas',
        'O Coração do Negócio: Gestão de Mudanças e Engajamento',
        'O Combustível do Aculturamento: Comunicação, RH e Incentivos na Prática',
        'Alfabetização em Dados: A Chave para uma Cultura Data-Driven',
      ],
    },
  ],
  /**
   * The AI module is an upsell inside the same product: it is offered in the
   * members area, after the purchase, and it is not part of the price on this
   * page. It is described here anyway, and labelled, because a buyer who finds
   * out about a paid add-on only after paying feels sold to -- and because
   * governing AI without governing data first is the mistake the whole module
   * exists to prevent, which is an argument for the main course as well.
   */
  aiModule: {
    icon: '🤖',
    title: 'Governança de IA (AIG)',
    summary:
      'Módulo adicional, oferecido separadamente dentro do próprio curso. Para quem já tem os fundamentos de dados de pé e agora precisa responder pelos modelos: classificação de riscos, planejamento de casos de uso, privacidade no treinamento, auditoria algorítmica e os direitos de quem está do outro lado da decisão.',
    lessons: [
      'A Bússola Ética da Governança de IA e a Classificação de Riscos',
      'O Canvas 5W2H para IA (Do Caso de Uso ao Planejamento)',
      'Dados Sintéticos e "Privacy by Design" no Treinamento',
      'O Fim da Caixa Preta: Model Cards e Auditoria Algorítmica',
      'O Coração da IA: Direitos ARCO, Explicabilidade e "Human-in-the-Loop"',
    ],
  },
};

/** Lessons in the paid-up-front course, which is the "16 aulas" on the page. */
export const LESSON_COUNT = COURSE.sections.reduce((total, section) => total + section.lessons.length, 0);

/** The list price, and the price with the launch coupon applied. */
const DISCOUNTED = COURSE.price * (1 - COURSE.couponPercent / 100);

/** Reais the way they are written in Brazil: a comma, and no cents when there are none. */
const formatBrl = (amount) =>
  `R$ ${amount
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace('.', ',')}`;

export const PRICE_LABEL = formatBrl(COURSE.price);
export const DISCOUNTED_LABEL = formatBrl(DISCOUNTED);

/** The checkout, with the launch coupon already applied. */
export const CHECKOUT_URL = `${COURSE.checkoutUrl}?offDiscount=${COURSE.coupon}`;

/**
 * What the buyer gets, in the order a buyer cares about it.
 *
 * The templates line names the number of files rather than the word "bonus",
 * because the files are the reason a reader who came for the free library keeps
 * reading, and it is the one item on this list nobody else selling a
 * Portuguese-language governance course can offer.
 */
const includedItems = (freeTemplates, lockedTemplates) => [
  {
    icon: 'fa-play',
    text: `${LESSON_COUNT} aulas em vídeo, em português, gravadas — você assiste no seu ritmo`,
  },
  {
    icon: 'fa-file-excel',
    text: `Os ${
      freeTemplates + lockedTemplates
    } modelos da biblioteca em Excel e Word editáveis, incluindo os ${lockedTemplates} que aqui no site aparecem na lista e não têm link`,
  },
  { icon: 'fa-award', text: 'Certificado de conclusão' },
  { icon: 'fa-lock', text: 'Acesso vitalício, sem assinatura e sem renovação' },
  {
    icon: 'fa-robot',
    text: `Módulo adicional de Governança de IA com ${COURSE.aiModule.lessons.length} aulas, ofertado dentro do curso`,
  },
  {
    icon: 'fa-rotate-left',
    text: `${COURSE.refundDays} dias de garantia: se não servir, você pede o reembolso pela Hotmart`,
  },
];

/** A button to the checkout. Same markup in three places on the page. */
const checkoutButton = (label, className = 'course-button') =>
  `<a class="${className}" href="${CHECKOUT_URL}" target="_blank" rel="noopener">${escapeHtml(
    label
  )}<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;

/**
 * Counts the free and locked templates in src/partials/template-library.html.
 *
 * Two classes, counted rather than trusted. `template-download-card__link` is
 * one per published file and `template-locked__item` is one per named-but-unsent
 * file, so the pair is the real shape of the library at build time. A zero means
 * one of those classes was renamed and this page would otherwise start offering
 * "0 modelos" in perfectly valid markup, so it fails the build instead.
 */
const countTemplates = (templatesPartial) => {
  const count = (needle) => templatesPartial.split(needle).length - 1;
  const free = count('template-download-card__link');
  const locked = count('template-locked__item');
  if (!free || !locked) {
    throw new Error(
      'scripts/lib/course.mjs counted 0 templates in src/partials/template-library.html: ' +
        `free=${free}, locked=${locked}. The course page quotes both numbers, so one of ` +
        'template-download-card__link / template-locked__item has been renamed there.'
    );
  }
  return { free, locked };
};

/**
 * The offer card: price, coupon, button, and the six things included.
 *
 * Near the top of the page, and repeated at the bottom by renderCourseClose,
 * because the reader who is already convinced should not have to scroll back up
 * to act and the reader who is not should not be asked to decide before reading
 * the curriculum.
 */
export const renderCourseOffer = (templatesPartial) => {
  const { free, locked } = countTemplates(templatesPartial);
  const items = includedItems(free, locked)
    .map(
      (item) =>
        `          <li><i class="fa-solid ${item.icon}" aria-hidden="true"></i><span>${escapeHtml(
          item.text
        )}</span></li>`
    )
    .join('\n');

  return `    <section class="page-section blog-shell" aria-labelledby="course-offer-title">
      <div class="course-offer">
        <div class="course-offer__buy">
          <p class="course-offer__label"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>Curso completo</p>
          <p class="course-offer__price">
            <span class="course-offer__price-was">${escapeHtml(PRICE_LABEL)}</span>
            <strong class="course-offer__price-now">${escapeHtml(DISCOUNTED_LABEL)}</strong>
          </p>
          <p class="course-offer__coupon">com o cupom <code>${escapeHtml(COURSE.coupon)}</code></p>
          <p class="course-offer__scarcity">${COURSE.couponPercent}% de desconto nas ${
            COURSE.couponSeats
          } primeiras inscrições. Depois o curso volta para ${escapeHtml(PRICE_LABEL)}.</p>
          ${checkoutButton('Quero me inscrever')}
          <p class="course-offer__note">O link abre o checkout da Hotmart com o cupom já aplicado. O valor aparece na moeda do seu país, convertido a partir de ${escapeHtml(
            PRICE_LABEL
          )}.</p>
        </div>
        <div class="course-offer__included">
          <h2 id="course-offer-title">O que está incluído</h2>
          <ul class="course-offer__list">
${items}
          </ul>
        </div>
      </div>
    </section>`;
};

/** The three sections, their lessons, and the AI module after them. */
export const renderCourseCurriculum = () => {
  const lessons = (items) =>
    `<ol class="course-lessons">${items
      .map((lesson) => `<li>${escapeHtml(lesson)}</li>`)
      .join('')}</ol>`;

  const sections = COURSE.sections
    .map(
      (section, index) => `        <li class="course-module">
          <p class="course-module__meta">
            <span class="course-module__number">${String(index + 1).padStart(2, '0')}</span>
            <span class="course-module__count">${section.lessons.length} aulas</span>
          </p>
          <h3><span class="course-module__icon" aria-hidden="true">${section.icon}</span>${escapeHtml(
            section.title
          )}</h3>
          <p class="course-module__summary">${escapeHtml(section.summary)}</p>
          ${lessons(section.lessons)}
        </li>`
    )
    .join('\n');

  const ai = COURSE.aiModule;

  return `    <section class="page-section blog-shell" aria-labelledby="course-curriculum-title">
      <h2 id="course-curriculum-title">As três seções</h2>
      <p class="course-section__intro">Na ordem em que um programa se monta de verdade: primeiro você decide para onde vai e com que autoridade, depois coloca o motor a funcionar, e depois — a parte que costuma ser tratada como opcional e é onde tudo desanda — convence as pessoas a andar nele.</p>
      <ol class="course-modules">
${sections}
      </ol>
      <div class="course-module course-module--extra">
        <p class="course-module__meta">
          <span class="course-module__number course-module__number--extra">+</span>
          <span class="course-module__count">${ai.lessons.length} aulas · módulo adicional pago</span>
        </p>
        <h3><span class="course-module__icon" aria-hidden="true">${ai.icon}</span>${escapeHtml(ai.title)}</h3>
        <p class="course-module__summary">${escapeHtml(ai.summary)}</p>
        ${lessons(ai.lessons)}
        <p class="course-module__note">Este módulo não está incluído no valor acima: ele é oferecido à parte, já dentro da área de membros, para quem quiser seguir de dados para modelos.</p>
      </div>
    </section>`;
};

/**
 * The templates argument, with both numbers counted out of the library itself.
 *
 * This is the block that connects the free half of the site to the paid one. It
 * is deliberately explicit about the deal -- six files free forever, eighteen
 * inside -- because the alternative reads as a bait: a reader who follows a
 * "free templates" link and finds a paywall stops believing the rest of the
 * page, and the free six are genuinely free and genuinely useful without ever
 * buying anything.
 */
export const renderCourseTemplates = (templatesPartial) => {
  const { free, locked } = countTemplates(templatesPartial);
  const total = free + locked;

  return `    <section class="page-section blog-shell" aria-labelledby="course-templates-title">
      <div class="course-templates">
        <p class="course-templates__label"><i class="fa-solid fa-table-cells-large" aria-hidden="true"></i>A biblioteca completa</p>
        <h2 id="course-templates-title">Os ${locked} modelos que a biblioteca nomeia e não entrega vêm com o curso</h2>
        <p>A <a href="${pagePath(
          'pt',
          'templates'
        )}">biblioteca de modelos</a> deste site tem ${total} arquivos. ${free} são gratuitos, sem formulário e sem e-mail, e continuam assim — pegue hoje, use na segunda-feira, nunca mais ouça falar de mim. Os outros ${locked} aparecem na lista, com nome e descrição, e sem link: política geral, termos de referência do comitê, padrão e registro de classificação, papéis e responsabilidades, glossário de negócio, catálogo, KPIs, matriz RACI, matriz de riscos, definição e registro de acessos, plano de comunicação, e o resto.</p>
        <p>Eles são entregues na área de membros da Hotmart, em Excel e Word editáveis, junto com a aula que explica quando cada um serve — que é a parte que faz diferença. Um modelo em branco é um arquivo; um modelo com a conversa que ele deve provocar é um artefato.</p>
      </div>
    </section>`;
};

/**
 * The questions that actually get asked before somebody buys a course on the
 * internet, answered in the same register as the rest of the site.
 *
 * Refund, certificate, access time and "what happens to the coupon" are here
 * because they are the four objections that stop a purchase, and because
 * Hotmart's own checkout answers none of them until after the card details.
 */
export const COURSE_FAQ = [
  {
    q: 'Para quem é este curso?',
    a: 'Para quem vai ter que implantar, e não para quem vai ter que opinar. Analistas e gestores de dados que receberam a tarefa de "colocar governança de pé", profissionais de negócio que viraram donos de um domínio sem pedir, e consultores que precisam de artefatos que funcionem em uma sala de reunião. Se você nunca tocou no assunto, a primeira seção começa do zero.',
  },
  {
    q: 'Preciso de conhecimento técnico ou de alguma ferramenta?',
    a: 'Não. Nada aqui depende de uma plataforma específica, e os artefatos são Excel e Word porque é o que existe em toda empresa. Se você já tem catálogo, qualidade ou um data lake, o curso encaixa neles; se não tem, a ordem das aulas é justamente a que evita comprar ferramenta antes de saber a pergunta.',
  },
  {
    q: 'Quanto tempo tenho de acesso?',
    a: 'Vitalício. Não é assinatura, não renova e não expira, e as aulas ficam disponíveis na área de membros da Hotmart quando você quiser rever.',
  },
  {
    q: 'O curso dá certificado?',
    a: 'Sim, um certificado de conclusão emitido pela plataforma quando você termina as aulas. Serve para registrar as horas junto ao seu RH ou para pendurar no LinkedIn; não é uma certificação da DAMA, que é outra coisa e tem exame próprio.',
  },
  {
    q: 'Como funciona o cupom PRIMEIROS10?',
    a: 'Dá 50% de desconto nas dez primeiras inscrições e depois deixa de valer. O botão desta página já abre o checkout com ele aplicado, então não é preciso digitar nada; se o valor aparecer cheio, é porque as dez já foram.',
  },
  {
    q: 'E se eu não gostar?',
    a: 'Você tem sete dias para pedir o reembolso pela própria Hotmart, sem precisar justificar e sem falar comigo. É o prazo de garantia da plataforma e é integral.',
  },
  {
    q: 'O módulo de Governança de IA está incluído?',
    a: 'Não. Ele é um módulo adicional, ofertado à parte dentro da área de membros, com cinco aulas sobre classificação de riscos, canvas 5W2H para IA, privacidade no treinamento, model cards e auditoria algorítmica. Está descrito nesta página para você saber que existe antes de comprar, não depois.',
  },
  {
    q: 'Recebo mesmo as planilhas que estão bloqueadas na biblioteca deste site?',
    a: 'Sim, as dezoito, em Excel e Word editáveis, na área de membros. As seis gratuitas da biblioteca continuam gratuitas aqui no site e você não precisa do curso para pegá-las.',
  },
  {
    q: 'Em que idioma é o curso?',
    a: 'Inteiramente em português. Foi essa a razão de existir dele: quase tudo de governança de dados aplicada está em inglês, e traduzir um vocabulário não é o mesmo que ensinar a operá-lo com um comitê brasileiro dentro de uma empresa brasileira.',
  },
  {
    q: 'Como eu pago?',
    a: `O checkout é da Hotmart, que cuida do pagamento, do acesso e da nota. O preço de lista é ${PRICE_LABEL}; se você estiver fora do Brasil, a plataforma converte para a sua moeda e mostra os meios de pagamento disponíveis no seu país.`,
  },
];

/** The accordion, in the same markup the FAQ page uses. See ./faq.mjs. */
export const renderCourseFaq = () => {
  const items = COURSE_FAQ.map(
    (item, index) => `        <details class="page-faq__item"${index === 0 ? ' open' : ''}>
          <summary class="page-faq__question">${escapeHtml(item.q)}</summary>
          <div class="page-faq__answer"><p>${escapeHtml(item.a)}</p></div>
        </details>`
  ).join('\n');

  return `    <section class="page-section blog-shell" aria-labelledby="course-faq-title">
      <h2 id="course-faq-title">Perguntas antes de comprar</h2>
      <div class="page-faq">
${items}
      </div>
    </section>`;
};

/** The last thing on the page: the offer again, in one line, with the button. */
export const renderCourseClose = () => `    <section class="page-section blog-shell" aria-labelledby="course-close-title">
      <div class="course-close">
        <h2 id="course-close-title">${LESSON_COUNT} aulas, em português, por ${escapeHtml(
          DISCOUNTED_LABEL
        )} nas ${COURSE.couponSeats} primeiras inscrições</h2>
        <p>Acesso vitalício, certificado no fim, a biblioteca completa de modelos em formato editável e ${
          COURSE.refundDays
        } dias para desistir sem explicar por quê.</p>
        <div class="course-close__actions">
          ${checkoutButton('Quero me inscrever')}
          <a class="course-button course-button--ghost" href="${pagePath(
            'pt',
            'templates'
          )}">Ver os modelos gratuitos primeiro</a>
        </div>
      </div>
    </section>`;

/**
 * The Course node, plus the Offer at the price the page shows.
 *
 * Every field here is something a reader can also read on the page, which is
 * the rule the rest of this site's structured data follows: the syllabus
 * mirrors renderCourseCurriculum, the price mirrors the offer card, and the
 * credential mirrors the FAQ answer about the certificate.
 *
 * Deliberately no `hasCourseInstance`: Google wants a `courseWorkload` with it
 * and the total running time of the videos is not a number this module can
 * know. A guessed duration in structured data is a claim about a product,
 * made in a machine-readable field, that nobody would ever proofread.
 */
export const courseSchema = (canonical, description) => ({
  '@type': 'Course',
  '@id': `${canonical}#course`,
  name: COURSE.name,
  description,
  url: canonical,
  inLanguage: 'pt',
  provider: { '@id': `${SITE_ORIGIN}/#organization` },
  isAccessibleForFree: false,
  educationalCredentialAwarded: 'Certificado de conclusão',
  teaches: COURSE.sections.map((section) => section.title),
  syllabusSections: COURSE.sections.map((section, index) => ({
    '@type': 'Syllabus',
    position: index + 1,
    name: section.title,
    description: section.summary,
  })),
  offers: {
    '@type': 'Offer',
    price: String(COURSE.price),
    priceCurrency: COURSE.currency,
    category: 'Paid',
    availability: 'https://schema.org/InStock',
    url: canonical,
  },
});

/** The FAQPage node for the questions above, worded exactly as they render. */
export const courseFaqSchema = (canonical) => ({
  '@type': 'FAQPage',
  '@id': `${canonical}#faq`,
  url: canonical,
  inLanguage: 'pt',
  name: 'Perguntas frequentes sobre o curso de governança de dados',
  isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
  mainEntity: COURSE_FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});
