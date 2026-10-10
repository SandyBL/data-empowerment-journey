/**
 * The course: the curriculum, the offer, and the blocks the pages at
 * /pt/curso-governanca-de-dados/, /es/curso-gobierno-de-datos/ and
 * /en/data-governance-course/ are built from.
 *
 * One product in three languages. The course is taught in Portuguese and sold
 * through a single Hotmart checkout; the videos now carry Spanish and English
 * subtitles, which is what makes a Spanish and an English page honest to
 * publish. The materials delivered with it -- the 31 templates included -- are
 * still the Portuguese originals. So the two translated pages say both things
 * where a buyer decides, not in small print: in the cover notice at the top, in
 * the offer card, in the templates block, in the FAQ and in the closing line.
 * A reader who pays expecting videos in their own language and finds subtitles
 * has been sold to; a reader told up front is choosing.
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
import { SITE_ORIGIN, imageCdn } from './brand.mjs';
import { pagePath } from './site-nav.mjs';

/**
 * The facts about the product that do not change with the language: one
 * checkout, one coupon, one list price in reais.
 *
 * The price is what the page shows and what the Offer node declares. Hotmart
 * converts it for the buyer's country at the checkout, so the page says so
 * rather than pretending the number is universal: a page promising R$ 99 to a
 * reader whose checkout opens at $22 has broken trust before the first video.
 */
export const COURSE = {
  checkoutUrl: 'https://pay.hotmart.com/T107402631R',
  coupon: 'PRIMEIROS10',
  couponSeats: 10,
  couponPercent: 50,
  price: 297,
  currency: 'BRL',
  refundDays: 7,
  /** The language the videos are in, whichever page sells them. */
  recordedIn: 'pt',
  /**
   * Every template the course hands out, and how many of those belong to the
   * add-on AI Governance module. The rest are the main course's, which must
   * cover the whole library on this site; renderCourseOffer checks that.
   */
  templates: 31,
  aiTemplates: 5,
  sectionIcons: ['🧭', '⚙️', '❤️'],
  aiIcon: '🤖',
  /** The cover art. Portuguese, like the product it advertises. */
  cover: { url: '/assets/images/course/curso-governanca-de-dados-v2.jpg', width: 1048, height: 1008 },
};

/**
 * Everything a reader reads, per language.
 *
 * The Portuguese is the original. The Spanish and English lesson titles are
 * translations of the Portuguese ones, so a reader can judge the curriculum in
 * their own language -- the videos behind them are the same Portuguese videos,
 * with subtitles, which is what every translated page says.
 */
const COPY = {
  pt: {
    name: 'Como Implantar Governança de Dados com Sucesso',
    credential: 'Certificado de conclusão',
    coverAlt:
      'Curso de Governança de Dados na prática: dezesseis aulas em vídeo e 26+5 modelos editáveis, tudo em português',
    languageNote: '',
    sections: [
      {
        title: 'A Bússola: Fundamentos da Governança de Dados na prática',
        summary:
          'É no começo que a maioria dos programas morre. Esta seção termina com um projeto descrito em uma página, uma linha de base medida, uma primeira política curta o bastante para ser lida, um comitê com mandato de verdade e os domínios de dados distribuídos entre as áreas que aceitaram assumi-los.',
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
        title: 'O Coração: Cultura de Dados e Alfabetização',
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
    aiModule: {
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
    included: ({ lessons, templates, aiTemplates, locked, aiLessons, refundDays }) => [
      { icon: 'fa-compass', text: 'Ao final, uma estratégia e um caminho claro para implantar ou melhorar a governança de dados na sua empresa' },
      { icon: 'fa-play', text: `${lessons} aulas em vídeo, em português — você assiste no seu ritmo` },
      {
        icon: 'fa-file-excel',
        text: `${templates} modelos em Excel e Word editáveis, ${aiTemplates} deles do módulo de Governança de IA, incluindo os ${locked} que aqui no site aparecem na lista da biblioteca e não têm link`,
      },
      { icon: 'fa-award', text: 'Certificado de conclusão' },
      { icon: 'fa-lock', text: 'Acesso vitalício, sem assinatura e sem renovação' },
      { icon: 'fa-robot', text: `Módulo adicional de Governança de IA com ${aiLessons} aulas, oferecido dentro do curso` },
      { icon: 'fa-rotate-left', text: `${refundDays} dias de garantia: se não servir, você pede o reembolso pela Hotmart` },
    ],
    offer: {
      label: 'Curso completo',
      couponWith: 'com o cupom',
      scarcity: (percent, seats, price) =>
        `${percent}% de desconto nas ${seats} primeiras inscrições. Depois o curso volta para ${price}.`,
      button: 'Quero me inscrever',
      note: (price) =>
        `O link abre o checkout da Hotmart com o cupom já aplicado. O valor aparece na moeda do seu país, convertido a partir de ${price}.`,
      includedTitle: 'O que está incluído',
    },
    curriculum: {
      title: 'As três seções',
      intro:
        'Na ordem em que um programa se monta de verdade: primeiro você decide para onde vai e com que autoridade, depois coloca o motor para funcionar, e depois — a parte que costuma ser tratada como opcional e é onde tudo desanda — convence as pessoas a andar nele. São os três pilares da metodologia Data Governance Journey, guiada pelo DAMA-DMBOK.',
      count: (n) => `${n} aulas`,
      aiCount: (n) => `${n} aulas · módulo adicional pago`,
      aiNote:
        'Este módulo não está incluído no valor acima: ele é oferecido à parte, já dentro da área de membros, para quem quiser avançar dos dados para os modelos.',
    },
    templates: {
      label: 'A biblioteca completa',
      heading: (locked, extra) => `Os ${locked} modelos que a biblioteca nomeia e não entrega, mais ${extra} extras, vêm com o curso`,
      body: ({ total, free, locked, extra, main, ai, href }) => [
        `A <a href="${href}">biblioteca de modelos</a> deste site tem ${total} arquivos. ${free} são gratuitos, sem formulário e sem e-mail, e continuam assim: você baixa, usa quando precisar e não fica devendo nada a ninguém. Os outros ${locked} aparecem na lista, com nome e descrição, e sem link: política geral, termos de referência do comitê, padrão e registro de classificação, papéis e responsabilidades, glossário de negócio, catálogo, KPIs, matriz RACI, matriz de riscos, definição e registro de acessos, plano de comunicação, entre outros.`,
        `Além deles, o curso traz ${extra} modelos extras que não estão na biblioteca do site. Somando os ${free} gratuitos, são ${main} modelos no curso principal, e o módulo de Governança de IA tem mais ${ai} próprios.`,
        'Todos são entregues na área de membros da Hotmart, em Excel e Word editáveis, junto com a aula que explica quando cada um serve — que é a parte que faz diferença. Um modelo em branco é um arquivo; um modelo com a conversa que ele deve provocar é um artefato.',
      ],
    },
    faqTitle: 'Perguntas antes de comprar',
    faqSchemaName: 'Perguntas frequentes sobre o curso de governança de dados',
    faq: (price) => [
      {
        q: 'Para quem é este curso?',
        a: 'Para quem vai ter que implantar, e não para quem vai ter que opinar. Analistas e gestores de dados que receberam a tarefa de "colocar governança de pé", profissionais de negócio que viraram donos de um domínio sem pedir, e consultores que precisam de artefatos que funcionem em uma sala de reunião. Se você nunca tocou no assunto, a primeira seção começa do zero.',
      },
      {
        q: 'Qual metodologia o curso segue?',
        a: 'A metodologia Data Governance Journey, a mesma apresentada neste site, baseada e guiada pelo framework DAMA-DMBOK. As três seções do curso são os três pilares dela: a Bússola (fundamentos), o Motor (operacionalização) e o Coração (cultura e gestão de mudança). O DMBOK diz o que um programa de governança precisa ter; o curso mostra como implantar isso, na ordem certa, numa empresa real.',
      },
      {
        q: 'Preciso de conhecimento técnico ou de alguma ferramenta?',
        a: 'Não. Nada aqui depende de uma plataforma específica, e os artefatos são Excel e Word porque é o que existe em toda empresa. Se você já tem uma ferramenta de catálogo, de qualidade ou um data lake, o curso se encaixa neles; se não tem, a ordem das aulas é justamente a que evita comprar ferramenta antes de saber do que você precisa.',
      },
      {
        q: 'Quanto tempo tenho de acesso?',
        a: 'Vitalício. Não é assinatura, não renova e não expira, e as aulas ficam disponíveis na área de membros da Hotmart quando você quiser rever.',
      },
      {
        q: 'O curso dá certificado?',
        a: 'Sim, um certificado de conclusão emitido pela plataforma quando você termina as aulas. Serve para registrar as horas junto ao seu RH ou para colocar no LinkedIn; não é uma certificação da DAMA, que é outra coisa e tem exame próprio.',
      },
      {
        q: 'Como funciona o cupom PRIMEIROS10?',
        a: 'Ele dá 50% de desconto nas dez primeiras inscrições e depois deixa de valer. O botão desta página já abre o checkout com ele aplicado, então não é preciso digitar nada; se aparecer o valor cheio, é porque as dez vagas já foram preenchidas.',
      },
      {
        q: 'E se eu não gostar?',
        a: 'Você tem sete dias para pedir o reembolso pela própria Hotmart, sem precisar justificar e sem falar comigo. É a garantia da própria plataforma, com reembolso integral.',
      },
      {
        q: 'O módulo de Governança de IA está incluído?',
        a: 'Não. Ele é um módulo adicional, oferecido à parte dentro da área de membros, com cinco aulas sobre classificação de riscos, canvas 5W2H para IA, privacidade no treinamento, model cards e auditoria algorítmica. Está descrito nesta página para você saber que existe antes de comprar, não depois.',
      },
      {
        q: 'Recebo mesmo os modelos que estão bloqueados na biblioteca deste site?',
        a: 'Sim, os dezoito, mais dois modelos extras que não estão na biblioteca, em Excel e Word editáveis, na área de membros. Os seis gratuitos da biblioteca continuam gratuitos aqui no site, e você não precisa do curso para baixá-los.',
      },
      {
        q: 'Em que idioma é o curso?',
        a: 'Em português, que é o idioma original de todas as aulas e de todos os modelos. Foi por isso que ele nasceu: quase tudo de governança de dados aplicada está em inglês, e traduzir um vocabulário não é o mesmo que ensinar a operá-lo com um comitê brasileiro dentro de uma empresa brasileira. Os vídeos também têm legendas em espanhol e em inglês, para quem quiser indicar o curso a colegas de outros países.',
      },
      {
        q: 'Como eu pago?',
        a: `O checkout é da Hotmart, que cuida do pagamento, do acesso e da nota fiscal. O preço de lista é ${price}; se você estiver fora do Brasil, a plataforma converte para a sua moeda e mostra os meios de pagamento disponíveis no seu país.`,
      },
    ],
    close: {
      heading: (lessons, price, seats) => `${lessons} aulas, em português, por ${price} nas ${seats} primeiras inscrições`,
      body: (refundDays) =>
        `Acesso vitalício, certificado ao final, a biblioteca completa de modelos em formato editável e ${refundDays} dias para desistir sem explicar por quê.`,
      ghost: 'Ver os modelos gratuitos primeiro',
    },
  },

  es: {
    name: 'Cómo implantar el gobierno de datos con éxito',
    credential: 'Certificado de finalización',
    coverAlt:
      'Curso de Gobierno de Datos en la práctica: dieciséis clases en vídeo y 26+5 plantillas editables. En portugués, con subtítulos en español',
    languageNote:
      'Los vídeos están en portugués, con subtítulos en español. Las plantillas y los materiales del curso están en portugués.',
    sections: [
      {
        title: 'La Brújula: fundamentos del gobierno de datos en la práctica',
        summary:
          'Es al principio cuando muere la mayoría de los programas. Esta sección termina con un proyecto descrito en una página, una línea base medida, una primera política lo bastante corta como para que alguien la lea, un comité con mandato de verdad y los dominios de datos repartidos entre áreas que han aceptado quedárselos.',
        lessons: [
          'Introducción al gobierno de datos en la práctica',
          'Cómo usar el Canvas 5W2H para estructurar un proyecto de gobierno de datos en una sola página',
          'Define la línea base con una Evaluación de Madurez en Gestión de Datos (DMMA)',
          'Cómo crear tu primera política de gobierno de datos',
          'Cómo formar el comité de gobierno de datos',
          'Cómo clasificar y calcular la criticidad de los datos, y por qué importa',
          'Cómo definir los dominios de datos e implicar a las áreas de negocio',
        ],
      },
      {
        title: 'El Motor: cómo operacionalizar los fundamentos del gobierno de datos',
        summary:
          'La parte que separa un marco aprobado de un programa que funciona. Metadatos y catálogo, seguridad y privacidad, calidad medida con DMAIC y la disciplina del "fit for purpose", más los engranajes que nadie te cuenta que existen hasta que tropiezas con ellos.',
        lessons: [
          'De la teoría a la acción: operacionalizar metadatos, calidad y seguridad',
          'Metadatos y catálogo: el GPS del ecosistema de datos',
          'Seguridad de datos y privacidad: proteger con inteligencia',
          'Calidad de datos: el método DMAIC y la práctica del "fit for purpose"',
          'Los engranajes ocultos de la operacionalización',
        ],
      },
      {
        title: 'El Corazón: cultura de datos y alfabetización',
        summary:
          'Ninguna política sobrevive a una organización que no quiere aplicarla. Gestión del cambio, implicación, el papel de la comunicación, de RR. HH. y de los incentivos, y la alfabetización de datos como condición para cualquier cosa que se parezca a una cultura data-driven.',
        lessons: [
          'El factor humano: por qué el gobierno es un viaje de personas',
          'El corazón del negocio: gestión del cambio e implicación',
          'El combustible de la cultura: comunicación, RR. HH. e incentivos en la práctica',
          'Alfabetización de datos: la clave de una cultura data-driven',
        ],
      },
    ],
    aiModule: {
      title: 'Gobierno de la IA (AIG)',
      summary:
        'Módulo adicional, ofrecido por separado dentro del propio curso. Para quien ya tiene en pie los fundamentos de datos y ahora tiene que responder por los modelos: clasificación de riesgos, planificación de casos de uso, privacidad en el entrenamiento, auditoría algorítmica y los derechos de quien está al otro lado de la decisión.',
      lessons: [
        'La brújula ética del gobierno de la IA y la clasificación de riesgos',
        'El Canvas 5W2H para IA (del caso de uso a la planificación)',
        'Datos sintéticos y "privacy by design" en el entrenamiento',
        'El fin de la caja negra: model cards y auditoría algorítmica',
        'El corazón de la IA: derechos ARCO, explicabilidad y "human-in-the-loop"',
      ],
    },
    included: ({ lessons, templates, aiTemplates, locked, aiLessons, refundDays }) => [
      { icon: 'fa-compass', text: 'Al final, una estrategia y un camino claro para implantar o mejorar el gobierno de datos en tu empresa' },
      {
        icon: 'fa-play',
        text: `${lessons} clases en vídeo en portugués, con subtítulos en español: las ves a tu ritmo`,
      },
      {
        icon: 'fa-file-excel',
        text: `${templates} plantillas en Excel y Word editables, en portugués, ${aiTemplates} de ellas del módulo de Gobierno de la IA, incluidas las ${locked} que la biblioteca de este sitio lista sin enlace`,
      },
      { icon: 'fa-award', text: 'Certificado de finalización' },
      { icon: 'fa-lock', text: 'Acceso de por vida, sin suscripción y sin renovación' },
      { icon: 'fa-robot', text: `Módulo adicional de Gobierno de la IA con ${aiLessons} clases, ofrecido dentro del curso` },
      { icon: 'fa-rotate-left', text: `${refundDays} días de garantía: si no te sirve, pides el reembolso a través de Hotmart` },
    ],
    offer: {
      label: 'Curso completo',
      couponWith: 'con el cupón',
      scarcity: (percent, seats, price) =>
        `${percent}% de descuento en las ${seats} primeras inscripciones. Después el curso vuelve a ${price}.`,
      button: 'Quiero inscribirme',
      note: (price) =>
        `El enlace abre el checkout de Hotmart con el cupón ya aplicado. El importe aparece en la moneda de tu país, convertido a partir de ${price} (reales brasileños).`,
      includedTitle: 'Qué incluye',
    },
    curriculum: {
      title: 'Las tres secciones',
      intro:
        'En el orden en que de verdad se monta un programa: primero decides adónde vas y con qué autoridad, luego pones el motor en marcha y después —la parte que suele tratarse como opcional y donde todo se tuerce— convences a la gente de subirse. Son los tres pilares de la metodología Data Governance Journey, guiada por el DAMA-DMBOK. Los títulos están traducidos; las clases están en portugués con subtítulos en español.',
      count: (n) => `${n} clases`,
      aiCount: (n) => `${n} clases · módulo adicional de pago`,
      aiNote:
        'Este módulo no está incluido en el precio de arriba: se ofrece aparte, ya dentro del área de miembros, para quien quiera pasar de los datos a los modelos.',
    },
    templates: {
      label: 'La biblioteca completa',
      heading: (locked, extra) => `Las ${locked} plantillas que la biblioteca nombra y no entrega, más ${extra} extra, vienen con el curso`,
      body: ({ total, free, locked, extra, main, ai, href }) => [
        `La <a href="${href}">biblioteca de plantillas</a> de este sitio tiene ${total} ficheros. ${free} son gratuitos, en español, sin formulario y sin correo, y seguirán así. Los otros ${locked} aparecen en la lista, con nombre y descripción, y sin enlace: política general, términos de referencia del comité, estándar y registro de clasificación, roles y responsabilidades, glosario de negocio, catálogo, KPI, matriz RACI, matriz de riesgos, definición y registro de accesos, plan de comunicación y el resto.`,
        `Además, el curso incluye ${extra} plantillas extra que no están en la biblioteca del sitio. Sumando las ${free} gratuitas, son ${main} plantillas en el curso principal, y el módulo de Gobierno de la IA tiene ${ai} más propias.`,
        'Todas se entregan en el área de miembros de Hotmart, en Excel y Word editables y <strong>en portugués</strong>, que es el idioma en que se crearon, junto con la clase que explica cuándo sirve cada uno. Una plantilla en blanco es un fichero; una plantilla con la conversación que debe provocar es un artefacto.',
      ],
    },
    faqTitle: 'Preguntas antes de comprar',
    faqSchemaName: 'Preguntas frecuentes sobre el curso de gobierno de datos',
    faq: (price) => [
      {
        q: '¿En qué idioma está el curso?',
        a: 'Las clases están en portugués y tienen subtítulos en español; es el mismo curso, en la misma plataforma, que se vende en Brasil. Las plantillas, los materiales descargables y la interfaz de algunas partes del área de miembros están en portugués. Si el portugués te resulta muy ajeno incluso con subtítulos, la garantía de siete días está para eso.',
      },
      {
        q: '¿Qué metodología sigue el curso?',
        a: 'La metodología Data Governance Journey, la misma que se presenta en este sitio, basada y guiada por el marco DAMA-DMBOK. Las tres secciones del curso son sus tres pilares: la Brújula (fundamentos), el Motor (operacionalización) y el Corazón (cultura y gestión del cambio). El DMBOK dice qué necesita un programa de gobierno; el curso enseña cómo implantarlo, en el orden correcto, en una empresa real.',
      },
      {
        q: '¿Para quién es este curso?',
        a: 'Para quien va a tener que implantar, no para quien va a tener que opinar. Analistas y responsables de datos a los que les han encargado "poner en pie el gobierno", profesionales de negocio que se han convertido en dueños de un dominio sin pedirlo, y consultores que necesitan artefactos que funcionen en una sala de reuniones. Si nunca has tocado el tema, la primera sección empieza desde cero.',
      },
      {
        q: '¿Necesito conocimientos técnicos o alguna herramienta?',
        a: 'No. Nada depende de una plataforma concreta, y los artefactos son Excel y Word porque es lo que hay en cualquier empresa. Si ya tienes catálogo, calidad o un data lake, el curso encaja en ellos; si no, el orden de las clases es justamente el que evita comprar herramienta antes de saber la pregunta.',
      },
      {
        q: '¿Cuánto tiempo tengo de acceso?',
        a: 'De por vida. No es una suscripción, no se renueva y no caduca, y las clases están disponibles en el área de miembros de Hotmart cuando quieras volver a verlas.',
      },
      {
        q: '¿El curso da certificado?',
        a: 'Sí, un certificado de finalización emitido por la plataforma cuando terminas las clases. Sirve para registrar las horas en tu empresa o para ponerlo en LinkedIn; no es una certificación de DAMA, que es otra cosa y tiene examen propio.',
      },
      {
        q: '¿Cómo funciona el cupón PRIMEIROS10?',
        a: 'Da un 50% de descuento en las diez primeras inscripciones y después deja de valer. El botón de esta página ya abre el checkout con el cupón aplicado, así que no hace falta escribir nada; si el precio aparece completo, es que las diez ya se han agotado.',
      },
      {
        q: '¿Y si no me gusta?',
        a: 'Tienes siete días para pedir el reembolso a través de la propia Hotmart, sin justificarlo y sin hablar conmigo. Es el plazo de garantía de la plataforma y es íntegro.',
      },
      {
        q: '¿El módulo de Gobierno de la IA está incluido?',
        a: 'No. Es un módulo adicional, ofrecido aparte dentro del área de miembros, con cinco clases sobre clasificación de riesgos, canvas 5W2H para IA, privacidad en el entrenamiento, model cards y auditoría algorítmica. Está descrito en esta página para que sepas que existe antes de comprar, no después.',
      },
      {
        q: '¿Recibo de verdad las plantillas bloqueadas de la biblioteca de este sitio?',
        a: 'Sí, las dieciocho, más dos plantillas extra que no están en la biblioteca, en Excel y Word editables, en el área de miembros, en su versión original en portugués. Las seis gratuitas de la biblioteca siguen siendo gratuitas aquí, en español, y no necesitas el curso para descargarlas.',
      },
      {
        q: '¿Cómo pago?',
        a: `El checkout es de Hotmart, que se encarga del pago, del acceso y de la factura. El precio de lista es ${price} (reales brasileños); la plataforma lo convierte a tu moneda y muestra los medios de pago disponibles en tu país.`,
      },
    ],
    close: {
      heading: (lessons, price, seats) =>
        `${lessons} clases en portugués con subtítulos en español, por ${price} en las ${seats} primeras inscripciones`,
      body: (refundDays) =>
        `Acceso de por vida, certificado al final, la biblioteca completa de plantillas editables (en portugués) y ${refundDays} días para echarte atrás sin explicar por qué.`,
      ghost: 'Ver antes las plantillas gratuitas',
    },
  },

  en: {
    name: 'How to Implement Data Governance Successfully',
    credential: 'Certificate of completion',
    coverAlt:
      'Practical Data Governance course: sixteen video lessons and 26+5 editable templates. In Portuguese, with English subtitles',
    languageNote:
      'The videos are in Portuguese, with English subtitles. The templates and course materials are in Portuguese.',
    sections: [
      {
        title: 'The Compass: data governance fundamentals in practice',
        summary:
          'The beginning is where most programmes die. This section ends with a project described on one page, a measured baseline, a first policy short enough to be read, a committee with a real mandate, and data domains shared out among business areas that have agreed to own them.',
        lessons: [
          'Introduction to data governance in practice',
          'Using the 5W2H Canvas to frame a data governance project on a single page',
          'Set the baseline with a Data Management Maturity Assessment (DMMA)',
          'Writing your first data governance policy',
          'How to form the data governance committee',
          'How to classify data and score its criticality, and why it matters',
          'How to define data domains and engage the business areas',
        ],
      },
      {
        title: 'The Engine: operationalising the data governance fundamentals',
        summary:
          'The part that separates an approved framework from a programme that works. Metadata and catalogue, security and privacy, quality measured with DMAIC and the discipline of "fit for purpose" — plus the hidden gears nobody warns you about until you trip over them.',
        lessons: [
          'From theory to action: operationalising metadata, quality and security',
          'Metadata and catalogue: the GPS of the data ecosystem',
          'Data security and privacy: protecting intelligently',
          'Data quality: the DMAIC method and the practice of "fit for purpose"',
          'The hidden gears of operationalisation',
        ],
      },
      {
        title: 'The Heart: data culture and literacy',
        summary:
          'No policy survives an organisation that does not want to apply it. Change management, engagement, the role of communication, HR and incentives, and data literacy as the precondition for anything resembling a data-driven culture.',
        lessons: [
          'The human factor: why governance is a journey of people',
          'The heart of the business: change management and engagement',
          'The fuel of culture change: communication, HR and incentives in practice',
          'Data literacy: the key to a data-driven culture',
        ],
      },
    ],
    aiModule: {
      title: 'AI Governance (AIG)',
      summary:
        'An add-on module, offered separately inside the course itself. For those who already have the data fundamentals in place and now have to answer for the models: risk classification, use-case planning, privacy in training, algorithmic auditing, and the rights of the person on the other side of the decision.',
      lessons: [
        'The ethical compass of AI governance and risk classification',
        'The 5W2H Canvas for AI (from use case to plan)',
        'Synthetic data and privacy by design in training',
        'The end of the black box: model cards and algorithmic auditing',
        'The heart of AI: data subject rights, explainability and human-in-the-loop',
      ],
    },
    included: ({ lessons, templates, aiTemplates, locked, aiLessons, refundDays }) => [
      { icon: 'fa-compass', text: 'By the end, a strategy and a clear path to implement or improve data governance in your company' },
      {
        icon: 'fa-play',
        text: `${lessons} video lessons in Portuguese, with English subtitles — watch at your own pace`,
      },
      {
        icon: 'fa-file-excel',
        text: `${templates} editable Excel and Word templates, in Portuguese, ${aiTemplates} of them from the AI Governance module, including the ${locked} this site's library lists without a link`,
      },
      { icon: 'fa-award', text: 'Certificate of completion' },
      { icon: 'fa-lock', text: 'Lifetime access, no subscription, no renewal' },
      { icon: 'fa-robot', text: `Add-on AI Governance module with ${aiLessons} lessons, offered inside the course` },
      { icon: 'fa-rotate-left', text: `${refundDays}-day guarantee: if it is not for you, request a refund through Hotmart` },
    ],
    offer: {
      label: 'Full course',
      couponWith: 'with the coupon',
      scarcity: (percent, seats, price) =>
        `${percent}% off for the first ${seats} enrolments. After that the course goes back to ${price}.`,
      button: 'Enrol now',
      note: (price) =>
        `The link opens the Hotmart checkout with the coupon already applied. The price is shown in your local currency, converted from ${price} (Brazilian reais).`,
      includedTitle: "What's included",
    },
    curriculum: {
      title: 'The three sections',
      intro:
        'In the order a programme is really built: first you decide where you are going and with what authority, then you get the engine running, and then — the part usually treated as optional, and where everything falls apart — you persuade people to ride in it. These are the three pillars of the Data Governance Journey methodology, guided by the DAMA-DMBOK. The titles are translated; the lessons are in Portuguese with English subtitles.',
      count: (n) => `${n} lessons`,
      aiCount: (n) => `${n} lessons · paid add-on module`,
      aiNote:
        'This module is not included in the price above: it is offered separately, inside the members area, for those who want to move on from data to models.',
    },
    templates: {
      label: 'The full library',
      heading: (locked, extra) => `The ${locked} templates the library names and does not hand out, plus ${extra} extra ones, come with the course`,
      body: ({ total, free, locked, extra, main, ai, href }) => [
        `This site's <a href="${href}">template library</a> has ${total} files. ${free} are free, in English, with no form and no email, and they stay that way. The other ${locked} are listed by name and description, without a link: overarching policy, committee terms of reference, classification standard and register, roles and responsibilities, business glossary, catalogue, KPIs, RACI matrix, risk matrix, access definition and log, communication plan, and the rest.`,
        `On top of those, the course adds ${extra} extra templates that are not in the site's library. With the ${free} free ones, that makes ${main} templates in the main course, and the AI Governance module has ${ai} more of its own.`,
        'They are all delivered in the Hotmart members area as editable Excel and Word files, <strong>in Portuguese</strong> — the language they were written in — alongside the lesson that explains when each one is useful. A blank template is a file; a template with the conversation it is meant to start is an artefact.',
      ],
    },
    faqTitle: 'Questions before you buy',
    faqSchemaName: 'Frequently asked questions about the data governance course',
    faq: (price) => [
      {
        q: 'What language is the course in?',
        a: 'The lessons are in Portuguese and carry English subtitles; it is the same course, on the same platform, that is sold in Brazil. The templates, the downloadable materials and parts of the members area interface are in Portuguese. If Portuguese feels too foreign even with subtitles, that is what the seven-day guarantee is for.',
      },
      {
        q: 'What methodology does the course follow?',
        a: 'The Data Governance Journey methodology, the same one set out on this site, based on and guided by the DAMA-DMBOK framework. The three sections of the course are its three pillars: the Compass (foundations), the Engine (operationalisation) and the Heart (culture and change management). The DMBOK says what a governance programme needs; the course shows how to put it in place, in the right order, in a real company.',
      },
      {
        q: 'Who is this course for?',
        a: 'For people who will have to implement governance, not just have opinions about it. Data analysts and managers who have been asked to "get governance off the ground", business people who became owners of a data domain without asking, and consultants who need artefacts that work in a meeting room. If you have never touched the subject, the first section starts from zero.',
      },
      {
        q: 'Do I need technical knowledge or a particular tool?',
        a: 'No. Nothing here depends on a specific platform, and the artefacts are Excel and Word because every company has them. If you already have a catalogue, a quality tool or a data lake, the course fits around them; if you do not, the order of the lessons is precisely the one that stops you buying a tool before you know the question.',
      },
      {
        q: 'How long do I have access?',
        a: 'For life. It is not a subscription, it does not renew and it does not expire, and the lessons stay available in the Hotmart members area whenever you want to revisit them.',
      },
      {
        q: 'Is there a certificate?',
        a: 'Yes, a certificate of completion issued by the platform when you finish the lessons. It is useful for logging training hours or for LinkedIn; it is not a DAMA certification, which is a different thing with its own exam.',
      },
      {
        q: 'How does the PRIMEIROS10 coupon work?',
        a: 'It gives 50% off the first ten enrolments and then stops working. The button on this page opens the checkout with it already applied, so there is nothing to type; if you see the full price, the ten are gone.',
      },
      {
        q: 'What if I do not like it?',
        a: 'You have seven days to request a refund through Hotmart itself, with no justification and without having to talk to me. It is the platform guarantee, and it is a full refund.',
      },
      {
        q: 'Is the AI Governance module included?',
        a: 'No. It is an add-on module, offered separately inside the members area, with five lessons on risk classification, the 5W2H canvas for AI, privacy in training, model cards and algorithmic auditing. It is described on this page so that you know it exists before you buy, not after.',
      },
      {
        q: 'Do I really get the templates that are locked in the library on this site?',
        a: 'Yes, all eighteen, plus two extra templates that are not in the library, as editable Excel and Word files in the members area, in their original Portuguese. The six free ones in the library stay free here, in English, and you do not need the course to download them.',
      },
      {
        q: 'How do I pay?',
        a: `Checkout is handled by Hotmart, which takes care of payment, access and the invoice. The list price is ${price} (Brazilian reais); the platform converts it into your currency and shows the payment methods available in your country.`,
      },
    ],
    close: {
      heading: (lessons, price, seats) =>
        `${lessons} lessons in Portuguese with English subtitles, for ${price} for the first ${seats} enrolments`,
      body: (refundDays) =>
        `Lifetime access, a certificate at the end, the full library of editable templates (in Portuguese) and ${refundDays} days to change your mind without explaining why.`,
      ghost: 'See the free templates first',
    },
  },
};

/** The copy for a language, failing loudly on one the course has no page in. */
const copyFor = (lang) => {
  const copy = COPY[lang];
  if (!copy) throw new Error(`scripts/lib/course.mjs has no course copy for "${lang}"`);
  return copy;
};

/** The product name in a language, for anything outside this module that names it. */
export const courseName = (lang) => copyFor(lang).name;

/** Lessons in the paid-up-front course, which is the "16 aulas" on the page. */
export const LESSON_COUNT = COPY.pt.sections.reduce((total, section) => total + section.lessons.length, 0);

/** The list price, and the price with the launch coupon applied. */
const DISCOUNTED = COURSE.price * (1 - COURSE.couponPercent / 100);

/**
 * Reais the way each language writes them: a decimal comma in Portuguese and
 * Spanish, a point in English, and no cents when there are none. The symbol
 * stays R$ in all three, because the currency does not change with the reader.
 */
const formatBrl = (amount, lang = 'pt') => {
  const number = amount.toFixed(2).replace(/\.00$/, '');
  return lang === 'en' ? `R$${number}` : `R$ ${number.replace('.', ',')}`;
};

export const PRICE_LABEL = formatBrl(COURSE.price);
export const DISCOUNTED_LABEL = formatBrl(DISCOUNTED);

/** The checkout, with the launch coupon already applied. Same link in every language. */
export const CHECKOUT_URL = `${COURSE.checkoutUrl}?offDiscount=${COURSE.coupon}`;

/**
 * The Google Ads account the course campaign reports to.
 *
 * The sale itself is counted by Hotmart, whose checkout fires this account's
 * purchase conversion once a payment is approved -- this site never sees the
 * payment. What the tag here does is keep the ad click attached to the visitor
 * across the hop to pay.hotmart.com (the linker adds the click to the checkout
 * URL), and record the click on the checkout button as `begin_checkout`, which
 * is a diagnostic signal, not the conversion the bids optimise for.
 *
 * Only the course pages load it: they are the pages the ads send traffic to,
 * and the rest of the site keeps its no-third-party-tracking stance.
 */
export const GOOGLE_ADS_ID = 'AW-18481323662';

export const courseHead = () =>
  `  <script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}"></script>
  <script src="/assets/js/google-ads.js" data-ads-id="${GOOGLE_ADS_ID}" data-checkout-host="${
    new URL(COURSE.checkoutUrl).host
  }" data-value="${DISCOUNTED}" data-currency="${COURSE.currency}"></script>
`;

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
 *
 * The partial carries all three languages inline, and every card and item is
 * one element whatever the language, so the count is the same for each page.
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
 * The cover art, and on the Spanish and English pages the language notice
 * under it.
 *
 * First on the page, above the fold, so it loads eagerly. The notice sits here
 * rather than further down because the language of the videos is the first
 * thing a reader outside Brazil needs to know and the one thing that would make
 * a purchase a mistake if they found it out afterwards.
 */
export const renderCourseCover = (lang) => {
  const copy = copyFor(lang);
  const { url, width, height } = COURSE.cover;
  const notice = copy.languageNote
    ? `
      <p class="course-language" lang="${lang}"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>${escapeHtml(
        copy.languageNote
      )}</span></p>`
    : '';

  return `    <section class="page-section blog-shell">
      <figure class="course-cover"><img src="${imageCdn(url, 1048)}" srcset="${imageCdn(url, 640)} 640w, ${imageCdn(
        url,
        1048
      )} 1048w" sizes="(max-width: 720px) 100vw, 640px" alt="${escapeHtml(
        copy.coverAlt
      )}" width="${width}" height="${height}" lang="${COURSE.recordedIn}" decoding="async" fetchpriority="high"></figure>${notice}
    </section>`;
};

/**
 * The offer card: price, coupon, button, and the six things included.
 *
 * Near the top of the page, and repeated at the bottom by renderCourseClose,
 * because the reader who is already convinced should not have to scroll back up
 * to act and the reader who is not should not be asked to decide before reading
 * the curriculum.
 */
export const renderCourseOffer = (lang, templatesPartial) => {
  const copy = copyFor(lang);
  const { free, locked } = countTemplates(templatesPartial);
  if (COURSE.templates - COURSE.aiTemplates < free + locked) {
    throw new Error(
      `scripts/lib/course.mjs says the course has ${COURSE.templates - COURSE.aiTemplates} templates outside the AI module, ` +
        `fewer than the ${free + locked} in src/partials/template-library.html, all of which the page says it includes.`
    );
  }
  const price = formatBrl(COURSE.price, lang);
  const discounted = formatBrl(DISCOUNTED, lang);
  const items = copy
    .included({
      lessons: LESSON_COUNT,
      templates: COURSE.templates,
      aiTemplates: COURSE.aiTemplates,
      locked,
      aiLessons: copy.aiModule.lessons.length,
      refundDays: COURSE.refundDays,
    })
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
          <p class="course-offer__label"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>${escapeHtml(
            copy.offer.label
          )}</p>
          <p class="course-offer__price">
            <span class="course-offer__price-was">${escapeHtml(price)}</span>
            <strong class="course-offer__price-now">${escapeHtml(discounted)}</strong>
          </p>
          <p class="course-offer__coupon">${escapeHtml(copy.offer.couponWith)} <code>${escapeHtml(COURSE.coupon)}</code></p>
          <p class="course-offer__scarcity">${escapeHtml(
            copy.offer.scarcity(COURSE.couponPercent, COURSE.couponSeats, price)
          )}</p>
          ${checkoutButton(copy.offer.button)}
          <p class="course-offer__note">${escapeHtml(copy.offer.note(price))}</p>
        </div>
        <div class="course-offer__included">
          <h2 id="course-offer-title">${escapeHtml(copy.offer.includedTitle)}</h2>
          <ul class="course-offer__list">
${items}
          </ul>
        </div>
      </div>
    </section>`;
};

/** The three sections, their lessons, and the AI module after them. */
export const renderCourseCurriculum = (lang) => {
  const copy = copyFor(lang);
  const lessons = (items) =>
    `<ol class="course-lessons">${items
      .map((lesson) => `<li>${escapeHtml(lesson)}</li>`)
      .join('')}</ol>`;

  const sections = copy.sections
    .map(
      (section, index) => `        <li class="course-module">
          <p class="course-module__meta">
            <span class="course-module__number">${String(index + 1).padStart(2, '0')}</span>
            <span class="course-module__count">${escapeHtml(copy.curriculum.count(section.lessons.length))}</span>
          </p>
          <h3><span class="course-module__icon" aria-hidden="true">${COURSE.sectionIcons[index]}</span>${escapeHtml(
            section.title
          )}</h3>
          <p class="course-module__summary">${escapeHtml(section.summary)}</p>
          ${lessons(section.lessons)}
        </li>`
    )
    .join('\n');

  const ai = copy.aiModule;

  return `    <section class="page-section blog-shell" aria-labelledby="course-curriculum-title">
      <h2 id="course-curriculum-title">${escapeHtml(copy.curriculum.title)}</h2>
      <p class="course-section__intro">${escapeHtml(copy.curriculum.intro)}</p>
      <ol class="course-modules">
${sections}
      </ol>
      <div class="course-module course-module--extra">
        <p class="course-module__meta">
          <span class="course-module__number course-module__number--extra">+</span>
          <span class="course-module__count">${escapeHtml(copy.curriculum.aiCount(ai.lessons.length))}</span>
        </p>
        <h3><span class="course-module__icon" aria-hidden="true">${COURSE.aiIcon}</span>${escapeHtml(ai.title)}</h3>
        <p class="course-module__summary">${escapeHtml(ai.summary)}</p>
        ${lessons(ai.lessons)}
        <p class="course-module__note">${escapeHtml(copy.curriculum.aiNote)}</p>
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
 * buying anything. On the Spanish and English pages it also says the eighteen
 * are in Portuguese, since the free six those readers already have are not.
 */
export const renderCourseTemplates = (lang, templatesPartial) => {
  const copy = copyFor(lang);
  const { free, locked } = countTemplates(templatesPartial);
  // The main course's templates are the whole library plus the ones only the
  // course has; renderCourseOffer fails the build if that would go negative.
  const main = COURSE.templates - COURSE.aiTemplates;
  const extra = main - free - locked;
  const paragraphs = copy.templates
    .body({ total: free + locked, free, locked, extra, main, ai: COURSE.aiTemplates, href: pagePath(lang, 'templates') })
    .map((paragraph) => `        <p>${paragraph}</p>`)
    .join('\n');

  return `    <section class="page-section blog-shell" aria-labelledby="course-templates-title">
      <div class="course-templates">
        <p class="course-templates__label"><i class="fa-solid fa-table-cells-large" aria-hidden="true"></i>${escapeHtml(
          copy.templates.label
        )}</p>
        <h2 id="course-templates-title">${escapeHtml(copy.templates.heading(locked, extra))}</h2>
${paragraphs}
      </div>
    </section>`;
};

/**
 * The questions that actually get asked before somebody buys a course on the
 * internet, answered in the same register as the rest of the site.
 *
 * Refund, certificate, access time and "what happens to the coupon" are here
 * because they are the four objections that stop a purchase, and because
 * Hotmart's own checkout answers none of them until after the card details. On
 * the translated pages the language question comes first, because for those
 * readers it is the objection that stops a purchase before any of the others.
 */
export const courseFaq = (lang) => copyFor(lang).faq(formatBrl(COURSE.price, lang));

/** The accordion, in the same markup the FAQ page uses. See ./faq.mjs. */
export const renderCourseFaq = (lang) => {
  const items = courseFaq(lang)
    .map(
      (item, index) => `        <details class="page-faq__item"${index === 0 ? ' open' : ''}>
          <summary class="page-faq__question">${escapeHtml(item.q)}</summary>
          <div class="page-faq__answer"><p>${escapeHtml(item.a)}</p></div>
        </details>`
    )
    .join('\n');

  return `    <section class="page-section blog-shell" aria-labelledby="course-faq-title">
      <h2 id="course-faq-title">${escapeHtml(copyFor(lang).faqTitle)}</h2>
      <div class="page-faq">
${items}
      </div>
    </section>`;
};

/** The last thing on the page: the offer again, in one line, with the button. */
export const renderCourseClose = (lang) => {
  const copy = copyFor(lang);
  return `    <section class="page-section blog-shell" aria-labelledby="course-close-title">
      <div class="course-close">
        <h2 id="course-close-title">${escapeHtml(
          copy.close.heading(LESSON_COUNT, formatBrl(DISCOUNTED, lang), COURSE.couponSeats)
        )}</h2>
        <p>${escapeHtml(copy.close.body(COURSE.refundDays))}</p>
        <div class="course-close__actions">
          ${checkoutButton(copy.offer.button)}
          <a class="course-button course-button--ghost" href="${pagePath(lang, 'templates')}">${escapeHtml(
            copy.close.ghost
          )}</a>
        </div>
      </div>
    </section>`;
};

/**
 * The Course node, plus the Offer at the price the page shows.
 *
 * Every field here is something a reader can also read on the page, which is
 * the rule the rest of this site's structured data follows: the syllabus
 * mirrors renderCourseCurriculum, the price mirrors the offer card, and the
 * credential mirrors the FAQ answer about the certificate.
 *
 * `inLanguage` is the language the course is taught in, which is Portuguese on
 * all three pages -- it describes the product, not the page selling it. The
 * page's own language is on the WebPage and FAQPage nodes.
 *
 * Deliberately no `hasCourseInstance`: Google wants a `courseWorkload` with it
 * and the total running time of the videos is not a number this module can
 * know. A guessed duration in structured data is a claim about a product,
 * made in a machine-readable field, that nobody would ever proofread.
 */
export const courseSchema = (lang, canonical, description) => {
  const copy = copyFor(lang);
  return {
    '@type': 'Course',
    '@id': `${canonical}#course`,
    name: copy.name,
    ...(lang === COURSE.recordedIn ? {} : { alternateName: COPY.pt.name }),
    description,
    url: canonical,
    inLanguage: COURSE.recordedIn,
    provider: { '@id': `${SITE_ORIGIN}/#organization` },
    isAccessibleForFree: false,
    educationalCredentialAwarded: copy.credential,
    teaches: copy.sections.map((section) => section.title),
    syllabusSections: copy.sections.map((section, index) => ({
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
  };
};

/** The FAQPage node for the questions above, worded exactly as they render. */
export const courseFaqSchema = (lang, canonical) => ({
  '@type': 'FAQPage',
  '@id': `${canonical}#faq`,
  url: canonical,
  inLanguage: lang,
  name: copyFor(lang).faqSchemaName,
  isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
  mainEntity: courseFaq(lang).map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});
