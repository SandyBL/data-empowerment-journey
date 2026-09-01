/**
 * The private space page: code gate, space hub and facilitator report.
 *
 * Served at /w/<slug>/ through a rewrite in netlify.toml, so the slug is read
 * from the path rather than a query string — the URL a facilitator pastes into a
 * chat window is the address of the space, and it has to look like one.
 *
 * Three views in one page because they are three steps of the same minute: type
 * the code, pick a simulator, and — if the seat is a sponsor seat — read what
 * the room actually did. Splitting them across pages would mean three round
 * trips to learn the same one thing, which is whether this browser has a seat.
 *
 * The report is rendered only for a sponsor seat, and only from what
 * /api/workspace/report returns. That endpoint refuses a participant seat, so
 * hiding the section here is presentation and not the access control: a
 * participant who forces the section open gets an empty one.
 *
 * All copy for the three languages lives in this file. The page ships with the
 * English strings in the markup so it reads without JavaScript, and every
 * element that has a translation carries data-copy.
 *
 * The one exception is the label and pillar tables below, which are imported:
 * the report endpoint writes the same labels into its CSV, and a scenario
 * description that says one thing on screen and another in the export is worse
 * than no description at all.
 */

import {
  BAND_LABELS,
  PILLAR_LABELS,
  PROFILE_LABELS,
  ROLE_LABELS,
  dimensionLabel as labelForDimension,
} from "/assets/js/simulator-analysis.mjs";

const SESSION_ENDPOINT = "/api/workspace/session";
const JOIN_ENDPOINT = "/api/workspace/join";
const REPORT_ENDPOINT = "/api/workspace/report";
const SCORES_ENDPOINT = "/api/simulator-scores";

/** The three simulators, with the localised names their own pages carry. */
const SIMULATORS = [
  {
    slug: "data-governance-day-to-day",
    maxScore: 100,
    name: {
      en: "Data Governance Day-to-Day",
      es: "El Día a Día en Gobierno de Datos",
      pt: "O Dia a Dia da Governança de Dados",
    },
    summary: {
      en: "Run a governance function for a quarter. Every decision moves efficiency, trust, accountability, security and context.",
      es: "Dirige una función de gobierno durante un trimestre. Cada decisión mueve eficiencia, confianza, responsabilidad, seguridad y contexto.",
      pt: "Conduza uma função de governança por um trimestre. Cada decisão move eficiência, confiança, responsabilidade, segurança e contexto.",
    },
  },
  {
    slug: "data-literacy",
    maxScore: 15,
    name: {
      en: "Data Literacy Simulator",
      es: "Simulador de Alfabetización de Datos",
      pt: "Simulador de Alfabetização de Dados",
    },
    summary: {
      en: "Fifteen decisions on governance, bias, AI, analytics and culture, scored against the optimal choice.",
      es: "Quince decisiones sobre gobernanza, sesgo, IA, analítica y cultura, medidas contra la opción óptima.",
      pt: "Quinze decisões sobre governança, viés, IA, analítica e cultura, medidas contra a escolha ótima.",
    },
  },
  {
    slug: "data-ownership-conflict",
    maxScore: 1000,
    name: {
      en: "Data Ownership Conflict",
      es: "Conflictos de Propiedad de Datos",
      pt: "Conflitos de Propriedade de Dados",
    },
    summary: {
      en: "Ten ownership disputes from real organisations. Decide who owns the data, and why.",
      es: "Diez disputas de propiedad reales. Decide de quién son los datos, y por qué.",
      pt: "Dez disputas de propriedade reais. Decida de quem são os dados, e por quê.",
    },
  },
];

const COPY = {
  en: {
    loading: "Checking your access…",
    gateEyebrow: "Private space",
    gateTitle: "Enter your access code",
    gateLead:
      "Your facilitator will give you the code for this session. It only opens this company's simulators and leaderboard.",
    codeLabel: "Access code",
    codeHint: "Dashes and capitals do not matter.",
    nameLabel: "Your name",
    nameHint:
      "Type the same name each time you come back, so this space remembers which simulators you have already played. Shown to colleagues in this space only, and never an email address.",
    missingName: "Please enter your name, so this space can remember your progress.",
    joinButton: "Enter the space",
    joining: "Checking…",
    hubLead:
      "Your organisation's simulators and leaderboards. The first run you finish of each simulator is saved automatically under your name — replays after that are practice — and the scores stay inside this space.",
    reportTitle: "Facilitator report",
    printButton: "Print or save as PDF",
    csvButton: "Download CSV",
    open: "Open",
    accessUntil: "Access until",
    seatedAs: "Seated as",
    sponsorSeat: "Sponsor access",
    participantSeat: "Participant",
    leaderIs: "Leading in this space:",
    noRunsYet: "No runs published in this space yet.",
    statusDone: "Played",
    statusPending: "Not played yet",
    // A replay is practice: the space keeps the first run each person
    // finishes, so the label has to stop implying the score can be improved.
    playAgain: "Replay for practice",
    yourScore: "Your recorded score",
    progressNone: "Nothing published under this name yet. Start with whichever simulator you like.",
    progressSome: "You have played {done} of {total}. Come back to this page with the same name to finish the rest.",
    progressAll: "You have played all {total} simulators in this space.",
    switchSpace: "You are seated in a different space. Leave it to enter this one.",
    leaveAndSwitch: "Leave the other space",
    badCode: "That code is not right for this space. Check it with your facilitator.",
    notFound: "We do not recognise this space address.",
    expired: "This space's access period has ended. Your consultant can extend it.",
    notStarted: "This space is not open yet.",
    suspended: "Access to this space is paused. Your consultant can restore it.",
    unavailable: "Something went wrong. Try again in a moment.",
    reportEmpty: "No runs have been published in this space yet, so there is nothing to report.",
    reportTruncated: "Showing the most recent runs only; the export contains the same set.",
    runs: "Runs",
    people: "People",
    simulatorsPlayed: "Simulators played",
    seatsOpened: "Seats opened",
    peopleJoined: "People who joined",
    averageScore: "Average score",
    bestScore: "Best score",
    medianTime: "Median time",
    distribution: "Score distribution",
    weakest: "Weakest dimensions first",
    weakestScenarios: "Scenarios, most missed first",
    weakestNote: "The top row is where a follow-up session should start.",
    dimension: "Dimension",
    average: "Average",
    runsCounted: "Runs",
    generated: "Generated",

    // The executive summary: one index, one standing and the five pillars,
    // across all three simulators. Written as sentence templates rather than as
    // assembled fragments, because a report a consultant hands to a client has
    // to read like prose in every language and not like a dashboard caption
    // translated word by word.
    executiveTitle: "Executive summary",
    executiveIndex: "Overall index",
    executiveStanding: "Overall standing",
    executiveCovered: "Simulators played",
    executiveLead:
      "{people} people published {runs} runs across {counted} of {available} simulators. This room's overall index is {index} out of 100, which reads as {band}.",
    executiveOne:
      "This room has played {counted} of {available} simulators so far, with an index of {index} out of 100 — {band}. The picture fills in as the others are played.",
    pillarsTitle: "Maturity pillars, pooled across the simulators",
    pillarsNote: "Each simulator measures part of the same five pillars; these are the pooled readings.",
    pillarStrongest: "Strongest pillar: {pillar}, at {value}%.",
    pillarWeakest: "Weakest pillar: {pillar}, at {value}% — this is the theme a follow-up session should open with.",
    pillarUnmeasured: "Still unmeasured: {pillars}. Playing {simulators} would cover them.",
    coverageAll:
      "{count} of {people} people played all {available} simulators, so this index describes the room and not a corner of it.",
    coveragePartial:
      "{count} of {people} people played only one simulator, so the index leans on whoever played the most.",
    confidenceIndicative:
      "Read as an indication, not a measurement: the smallest group behind a simulator is {count}, and these figures settle from about {needed} people.",
    confidenceBaseline:
      "Every simulator here has at least {needed} people behind it, so these figures are usable as a baseline to re-measure against later.",
    spreadNote: "Widest disagreement: {simulator}, from {min}% to {max}%.",

    // The room-level version of the report each player got on their own results
    // screen.
    roomProfile: "Room profile",
    strengths: "Holding up",
    gaps: "Needs work",
    noStrengths: "Nothing is above {threshold}% yet.",
    noGaps: "Nothing sits below {threshold}%.",
    focusNote: "Start here: {dimension}, at {value}%.",
    correctOf: "{correct} of {runs} got this right",
    rolesTitle: "Accuracy by who should have owned the decision",
    rolesNote: "A low row is a role this room does not think to hold accountable.",
    consensusTight:
      "The room broadly agrees — {spread} points between its lowest and highest run — so the average is worth acting on as one number.",
    consensusSplit:
      "The room is split: {spread} points between its lowest and highest run, so the average is hiding two different rooms.",
    singleRun: "One run only, so this is one person's reading rather than the room's.",

    // One sentence per room profile per simulator: the same verdict the players
    // read on their own screens, restated for a room rather than a person.
    roomBands: {
      "data-governance-day-to-day": {
        leader:
          "This room governs structurally. It funds the work before the incident rather than after it, and decisions hold across a quarter.",
        reactive:
          "This room governs by reaction. The calls are mostly sound but arrive after the problem, which is what keeps the same issues returning.",
        firefighter:
          "This room fights fires. Data work happens in silos and under pressure, so nothing compounds from one quarter to the next.",
      },
      "data-literacy": {
        champion:
          "This room reads data critically and is clear about what it may and may not conclude from a number.",
        strategist:
          "This room is literate and thinks strategically about data; the gap is in specific techniques rather than in mindset.",
        tactical:
          "This room uses data tactically, question by question, without a shared idea of what counts as good evidence.",
        hoarder:
          "This room collects more data than it interprets. Volume is not the constraint here; reading it is.",
      },
      "data-ownership-conflict": {
        master:
          "This room knows who should own what: decisions land with the role accountable for the outcome, not the role nearest the data.",
        practitioner:
          "This room places the clear decisions correctly, but the ambiguous ones drift to whoever is closest rather than whoever is accountable.",
        rookie:
          "This room sends data decisions to whoever is technically nearest. That reflex is where ownership disputes start.",
      },
    },
  },
  es: {
    loading: "Comprobando tu acceso…",
    gateEyebrow: "Espacio privado",
    gateTitle: "Introduce tu código de acceso",
    gateLead:
      "Tu facilitador te dará el código de esta sesión. Solo abre los simuladores y la clasificación de esta empresa.",
    codeLabel: "Código de acceso",
    codeHint: "Los guiones y las mayúsculas no importan.",
    nameLabel: "Tu nombre",
    nameHint:
      "Escribe el mismo nombre cada vez que vuelvas, así este espacio recuerda qué simuladores ya jugaste. Visible solo para tus colegas de este espacio, y nunca un correo electrónico.",
    missingName: "Escribe tu nombre para que este espacio pueda recordar tu progreso.",
    joinButton: "Entrar al espacio",
    joining: "Comprobando…",
    hubLead:
      "Los simuladores y las clasificaciones de tu organización. La primera partida que termines de cada simulador se guarda automáticamente con tu nombre —las repeticiones son práctica— y las puntuaciones no salen de este espacio.",
    reportTitle: "Informe del facilitador",
    printButton: "Imprimir o guardar en PDF",
    csvButton: "Descargar CSV",
    open: "Abrir",
    accessUntil: "Acceso hasta",
    seatedAs: "Entraste como",
    sponsorSeat: "Acceso de patrocinador",
    participantSeat: "Participante",
    leaderIs: "Lidera este espacio:",
    noRunsYet: "Todavía no hay partidas publicadas en este espacio.",
    statusDone: "Jugado",
    statusPending: "Aún sin jugar",
    playAgain: "Repetir para practicar",
    yourScore: "Tu puntuación registrada",
    progressNone: "Todavía no hay nada publicado con este nombre. Empieza por el simulador que prefieras.",
    progressSome: "Has jugado {done} de {total}. Vuelve a esta página con el mismo nombre para completar el resto.",
    progressAll: "Has jugado los {total} simuladores de este espacio.",
    switchSpace: "Estás en otro espacio. Sal de él para entrar en este.",
    leaveAndSwitch: "Salir del otro espacio",
    badCode: "Ese código no corresponde a este espacio. Confírmalo con tu facilitador.",
    notFound: "No reconocemos esta dirección de espacio.",
    expired: "El periodo de acceso de este espacio ha terminado. Tu consultora puede ampliarlo.",
    notStarted: "Este espacio aún no está abierto.",
    suspended: "El acceso a este espacio está en pausa. Tu consultora puede restablecerlo.",
    unavailable: "Algo salió mal. Inténtalo de nuevo en un momento.",
    reportEmpty: "Aún no se han publicado partidas en este espacio, así que no hay nada que informar.",
    reportTruncated: "Se muestran solo las partidas más recientes; la exportación contiene el mismo conjunto.",
    runs: "Partidas",
    people: "Personas",
    simulatorsPlayed: "Simuladores jugados",
    seatsOpened: "Accesos abiertos",
    peopleJoined: "Personas que entraron",
    averageScore: "Puntuación media",
    bestScore: "Mejor puntuación",
    medianTime: "Tiempo mediano",
    distribution: "Distribución de puntuaciones",
    weakest: "Dimensiones más débiles primero",
    weakestScenarios: "Escenarios, los más fallados primero",
    weakestNote: "La primera fila es por donde debería empezar la siguiente sesión.",
    dimension: "Dimensión",
    average: "Media",
    runsCounted: "Partidas",
    generated: "Generado",

    // El resumen ejecutivo: un índice, una posición y los cinco pilares, sobre
    // los tres simuladores. Redactado como plantillas de frase y no como
    // fragmentos encadenados, porque un informe que una consultora entrega a un
    // cliente tiene que leerse como prosa en cada idioma.
    executiveTitle: "Resumen ejecutivo",
    executiveIndex: "Índice global",
    executiveStanding: "Posición global",
    executiveCovered: "Simuladores jugados",
    executiveLead:
      "{people} personas publicaron {runs} partidas en {counted} de {available} simuladores. El índice global de esta sala es {index} sobre 100, lo que se lee como {band}.",
    executiveOne:
      "Esta sala ha jugado {counted} de {available} simuladores, con un índice de {index} sobre 100 — {band}. El cuadro se completa a medida que se jueguen los demás.",
    pillarsTitle: "Pilares de madurez, agregados entre simuladores",
    pillarsNote: "Cada simulador mide una parte de los mismos cinco pilares; estas son las lecturas agregadas.",
    pillarStrongest: "Pilar más fuerte: {pillar}, con {value}%.",
    pillarWeakest: "Pilar más débil: {pillar}, con {value}% — por aquí debería empezar la siguiente sesión.",
    pillarUnmeasured: "Aún sin medir: {pillars}. Jugar {simulators} lo cubriría.",
    coverageAll:
      "{count} de {people} personas jugaron los {available} simuladores, así que este índice describe la sala y no una parte de ella.",
    coveragePartial:
      "{count} de {people} personas jugaron solo un simulador, así que el índice se apoya en quien jugó más.",
    confidenceIndicative:
      "Léelo como indicación, no como medición: el grupo más pequeño detrás de un simulador es de {count}, y estas cifras se estabilizan a partir de unas {needed} personas.",
    confidenceBaseline:
      "Cada simulador tiene al menos {needed} personas detrás, así que estas cifras sirven como línea base para volver a medir más adelante.",
    spreadNote: "Mayor desacuerdo: {simulator}, de {min}% a {max}%.",

    roomProfile: "Perfil de la sala",
    strengths: "Se sostiene",
    gaps: "Hay que trabajarlo",
    noStrengths: "Todavía nada supera el {threshold}%.",
    noGaps: "Nada queda por debajo del {threshold}%.",
    focusNote: "Empieza por aquí: {dimension}, con {value}%.",
    correctOf: "{correct} de {runs} lo acertaron",
    rolesTitle: "Acierto según quién debía asumir la decisión",
    rolesNote: "Una fila baja es un rol al que esta sala no piensa en responsabilizar.",
    consensusTight:
      "La sala coincide en general — {spread} puntos entre su partida más baja y la más alta — así que la media se puede tomar como un único número.",
    consensusSplit:
      "La sala está dividida: {spread} puntos entre su partida más baja y la más alta, así que la media esconde dos salas distintas.",
    singleRun: "Solo una partida, así que es la lectura de una persona y no de la sala.",

    roomBands: {
      "data-governance-day-to-day": {
        leader:
          "Esta sala gobierna de forma estructural. Financia el trabajo antes del incidente y no después, y sus decisiones aguantan todo un trimestre.",
        reactive:
          "Esta sala gobierna por reacción. Las decisiones son en general acertadas, pero llegan después del problema, y por eso los mismos temas vuelven.",
        firefighter:
          "Esta sala apaga fuegos. El trabajo con datos ocurre en silos y bajo presión, así que nada se acumula de un trimestre al siguiente.",
      },
      "data-literacy": {
        champion:
          "Esta sala lee los datos con criterio y tiene claro qué puede y qué no puede concluir de un número.",
        strategist:
          "Esta sala es competente y piensa los datos de forma estratégica; la brecha está en técnicas concretas, no en la mentalidad.",
        tactical:
          "Esta sala usa los datos de forma táctica, pregunta a pregunta, sin una idea compartida de qué es una buena evidencia.",
        hoarder:
          "Esta sala acumula más datos de los que interpreta. El límite no es el volumen, es leerlos.",
      },
      "data-ownership-conflict": {
        master:
          "Esta sala sabe quién debe asumir qué: las decisiones caen en el rol responsable del resultado, no en el más cercano al dato.",
        practitioner:
          "Esta sala coloca bien las decisiones claras, pero las ambiguas se van hacia quien está más cerca en lugar de quien responde por ellas.",
        rookie:
          "Esta sala envía las decisiones de datos a quien está técnicamente más cerca. Ese reflejo es donde empiezan los conflictos de propiedad.",
      },
    },
  },
  pt: {
    loading: "A verificar o seu acesso…",
    gateEyebrow: "Espaço privado",
    gateTitle: "Introduza o seu código de acesso",
    gateLead:
      "O seu facilitador dará o código desta sessão. Ele abre apenas os simuladores e o ranking desta empresa.",
    codeLabel: "Código de acesso",
    codeHint: "Hífens e maiúsculas não importam.",
    nameLabel: "O seu nome",
    nameHint:
      "Escreva o mesmo nome sempre que voltar, para que este espaço lembre quais simuladores você já jogou. Visível apenas para os colegas deste espaço, e nunca um e-mail.",
    missingName: "Escreva o seu nome para que este espaço possa lembrar o seu progresso.",
    joinButton: "Entrar no espaço",
    joining: "A verificar…",
    hubLead:
      "Os simuladores e rankings da sua organização. A primeira partida que terminar de cada simulador é registada automaticamente com o seu nome — as repetições são treino — e as pontuações não saem deste espaço.",
    reportTitle: "Relatório do facilitador",
    printButton: "Imprimir ou guardar em PDF",
    csvButton: "Descarregar CSV",
    open: "Abrir",
    accessUntil: "Acesso até",
    seatedAs: "Entrou como",
    sponsorSeat: "Acesso de patrocinador",
    participantSeat: "Participante",
    leaderIs: "Lidera este espaço:",
    noRunsYet: "Ainda não há partidas publicadas neste espaço.",
    statusDone: "Jogado",
    statusPending: "Ainda não jogado",
    playAgain: "Repetir para treinar",
    yourScore: "A sua pontuação registada",
    progressNone: "Ainda não há nada publicado com este nome. Comece pelo simulador que preferir.",
    progressSome: "Você jogou {done} de {total}. Volte a esta página com o mesmo nome para concluir os restantes.",
    progressAll: "Você jogou todos os {total} simuladores deste espaço.",
    switchSpace: "Está noutro espaço. Saia dele para entrar neste.",
    leaveAndSwitch: "Sair do outro espaço",
    badCode: "Esse código não corresponde a este espaço. Confirme com o seu facilitador.",
    notFound: "Não reconhecemos este endereço de espaço.",
    expired: "O período de acesso deste espaço terminou. A sua consultora pode prolongá-lo.",
    notStarted: "Este espaço ainda não está aberto.",
    suspended: "O acesso a este espaço está em pausa. A sua consultora pode restabelecê-lo.",
    unavailable: "Algo falhou. Tente novamente dentro de um momento.",
    reportEmpty: "Ainda não foram publicadas partidas neste espaço, por isso não há nada a relatar.",
    reportTruncated: "A mostrar apenas as partidas mais recentes; a exportação contém o mesmo conjunto.",
    runs: "Partidas",
    people: "Pessoas",
    simulatorsPlayed: "Simuladores jogados",
    seatsOpened: "Acessos abertos",
    peopleJoined: "Pessoas que entraram",
    averageScore: "Pontuação média",
    bestScore: "Melhor pontuação",
    medianTime: "Tempo mediano",
    distribution: "Distribuição das pontuações",
    weakest: "Dimensões mais fracas primeiro",
    weakestScenarios: "Cenários, os mais falhados primeiro",
    weakestNote: "A primeira linha é por onde a próxima sessão deve começar.",
    dimension: "Dimensão",
    average: "Média",
    runsCounted: "Partidas",
    generated: "Gerado",

    // O resumo executivo: um índice, uma posição e os cinco pilares, sobre os
    // três simuladores. Escrito como modelos de frase e não como fragmentos
    // encadeados, porque um relatório que uma consultora entrega a um cliente
    // tem de ler-se como prosa em cada idioma.
    executiveTitle: "Resumo executivo",
    executiveIndex: "Índice global",
    executiveStanding: "Posição global",
    executiveCovered: "Simuladores jogados",
    executiveLead:
      "{people} pessoas publicaram {runs} partidas em {counted} de {available} simuladores. O índice global desta sala é {index} em 100, o que se lê como {band}.",
    executiveOne:
      "Esta sala jogou {counted} de {available} simuladores, com um índice de {index} em 100 — {band}. O quadro completa-se à medida que os restantes forem jogados.",
    pillarsTitle: "Pilares de maturidade, agregados entre simuladores",
    pillarsNote: "Cada simulador mede uma parte dos mesmos cinco pilares; estas são as leituras agregadas.",
    pillarStrongest: "Pilar mais forte: {pillar}, com {value}%.",
    pillarWeakest: "Pilar mais fraco: {pillar}, com {value}% — é por aqui que a próxima sessão deve começar.",
    pillarUnmeasured: "Ainda sem medição: {pillars}. Jogar {simulators} cobriria isso.",
    coverageAll:
      "{count} de {people} pessoas jogaram os {available} simuladores, por isso este índice descreve a sala e não um canto dela.",
    coveragePartial:
      "{count} de {people} pessoas jogaram apenas um simulador, por isso o índice apoia-se em quem jogou mais.",
    confidenceIndicative:
      "Leia como indicação e não como medição: o grupo mais pequeno por trás de um simulador é de {count}, e estes números estabilizam a partir de cerca de {needed} pessoas.",
    confidenceBaseline:
      "Cada simulador tem pelo menos {needed} pessoas por trás, por isso estes números servem de linha de base para voltar a medir mais tarde.",
    spreadNote: "Maior desacordo: {simulator}, de {min}% a {max}%.",

    roomProfile: "Perfil da sala",
    strengths: "Está sólido",
    gaps: "Precisa de trabalho",
    noStrengths: "Ainda nada passa dos {threshold}%.",
    noGaps: "Nada fica abaixo dos {threshold}%.",
    focusNote: "Comece por aqui: {dimension}, com {value}%.",
    correctOf: "{correct} de {runs} acertaram",
    rolesTitle: "Acerto por quem devia assumir a decisão",
    rolesNote: "Uma linha baixa é um papel que esta sala não se lembra de responsabilizar.",
    consensusTight:
      "A sala concorda no geral — {spread} pontos entre a partida mais baixa e a mais alta — por isso a média pode ser tratada como um número único.",
    consensusSplit:
      "A sala está dividida: {spread} pontos entre a partida mais baixa e a mais alta, por isso a média esconde duas salas diferentes.",
    singleRun: "Apenas uma partida, por isso esta é a leitura de uma pessoa e não da sala.",

    roomBands: {
      "data-governance-day-to-day": {
        leader:
          "Esta sala governa de forma estrutural. Financia o trabalho antes do incidente e não depois, e as decisões aguentam um trimestre inteiro.",
        reactive:
          "Esta sala governa por reação. As decisões são em geral acertadas, mas chegam depois do problema, e é por isso que os mesmos temas voltam.",
        firefighter:
          "Esta sala apaga fogos. O trabalho com dados acontece em silos e sob pressão, por isso nada se acumula de um trimestre para o outro.",
      },
      "data-literacy": {
        champion:
          "Esta sala lê os dados com critério e tem claro o que pode e o que não pode concluir de um número.",
        strategist:
          "Esta sala é competente e pensa os dados de forma estratégica; a lacuna está em técnicas concretas, não na mentalidade.",
        tactical:
          "Esta sala usa os dados de forma tática, pergunta a pergunta, sem uma ideia partilhada do que é boa evidência.",
        hoarder:
          "Esta sala acumula mais dados do que interpreta. O limite não é o volume, é lê-los.",
      },
      "data-ownership-conflict": {
        master:
          "Esta sala sabe quem deve assumir o quê: as decisões caem no papel responsável pelo resultado e não no mais próximo do dado.",
        practitioner:
          "Esta sala coloca bem as decisões claras, mas as ambíguas escorregam para quem está mais perto em vez de quem responde por elas.",
        rookie:
          "Esta sala envia as decisões de dados para quem está tecnicamente mais perto. Esse reflexo é onde começam os conflitos de propriedade.",
      },
    },
  },
};

const view = {
  loading: document.querySelector("#space-loading"),
  gate: document.querySelector("#space-gate"),
  gateForm: document.querySelector("#space-gate-form"),
  gateError: document.querySelector("#space-gate-error"),
  code: document.querySelector("#space-code"),
  label: document.querySelector("#space-label"),
  joinButton: document.querySelector("#space-join"),
  hub: document.querySelector("#space-hub"),
  hubTitle: document.querySelector("#space-hub-title"),
  hubMeta: document.querySelector("#space-hub-meta"),
  hubCards: document.querySelector("#space-hub-cards"),
  hubFoot: document.querySelector("#space-hub-foot"),
  report: document.querySelector("#space-report"),
  reportSummary: document.querySelector("#space-report-summary"),
  reportBody: document.querySelector("#space-report-body"),
  reportFoot: document.querySelector("#space-report-foot"),
  reportPrint: document.querySelector("#space-report-print"),
  reportCsv: document.querySelector("#space-report-csv"),
  client: document.querySelector("#space-client"),
  clientLogo: document.querySelector("#space-client-logo"),
  clientName: document.querySelector("#space-client-name"),
};

/** The slug from /w/<slug>/, or from ?space= when the page is opened directly. */
function readSlug() {
  const fromPath = /^\/w\/([^/?#]+)/.exec(window.location.pathname);
  const raw = fromPath ? fromPath[1] : new URLSearchParams(window.location.search).get("space");
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

let locale = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
if (!COPY[locale]) locale = "en";

function words() {
  return COPY[locale];
}

/** Swaps every translatable string on the page into the space's own language. */
function applyCopy() {
  document.documentElement.setAttribute("lang", locale);
  const dictionary = words();
  for (const node of document.querySelectorAll("[data-copy]")) {
    const value = dictionary[node.getAttribute("data-copy")];
    if (typeof value === "string") node.textContent = value;
  }
}

/** A copy string with {placeholders} filled in. Missing keys are left alone. */
function fill(template, values) {
  return String(template || "").replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function show(section) {
  for (const candidate of [view.loading, view.gate, view.hub]) {
    if (candidate) candidate.hidden = candidate !== section;
  }
  if (section !== view.hub && view.report) view.report.hidden = true;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

function formatDuration(ms) {
  // null is what the endpoint sends for a simulator that records no timings, and
  // Number(null) is 0 -- which rendered as "0:00" and read as a room that
  // finished instantly. An absent duration is an em dash, not a fast one.
  if (ms === null || ms === undefined || ms === "") return "—";
  const value = Number(ms);
  if (!Number.isFinite(value) || value < 0) return "—";
  const totalSeconds = Math.round(value / 1000);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${Math.floor(totalSeconds / 60)}:${seconds}`;
}

/**
 * A dimension key as a person reads it.
 *
 * The keys are positional on purpose -- a room playing three languages has to
 * aggregate, so the stored key is never a translated label -- which is why this
 * needs the simulator to know what "scenario-4" was about. It used to render
 * that as "Scenario 4", a row number offered to a sponsor as a finding.
 */
function dimensionLabel(simulator, key) {
  return labelForDimension(simulator, key, locale);
}

function simulatorName(slug) {
  const simulator = SIMULATORS.find((candidate) => candidate.slug === slug);
  return simulator ? simulator.name[locale] || simulator.name.en : slug;
}

/** Maps a closed-space or refused-code reason onto the sentence for it. */
function reasonMessage(reason) {
  const dictionary = words();
  return (
    {
      "bad-code": dictionary.badCode,
      "missing-name": dictionary.missingName,
      "not-found": dictionary.notFound,
      expired: dictionary.expired,
      "not-started": dictionary.notStarted,
      suspended: dictionary.suspended,
    }[reason] || dictionary.unavailable
  );
}

function renderClientBadge(space) {
  if (!space) return;
  view.clientName.textContent = space.company || space.displayName || "";
  if (space.logoUrl) {
    view.clientLogo.src = space.logoUrl;
    view.clientLogo.alt = space.company || "";
    view.clientLogo.hidden = false;
  }
  if (space.accentColor) {
    document.documentElement.style.setProperty("--workspace-accent", space.accentColor);
  }
  view.client.hidden = false;
}

/* -------------------------------------------------------------------------
 * Gate
 * ---------------------------------------------------------------------- */

function renderGate(space, reason) {
  if (space) {
    renderClientBadge(space);
    if (space.locale && COPY[space.locale]) {
      locale = space.locale;
      applyCopy();
    }
    view.gate.querySelector("#space-gate-title").textContent = space.displayName || words().gateTitle;
  }

  view.gateError.textContent = reason ? reasonMessage(reason) : "";
  // A space that is shut cannot be opened by any code, so the form goes with the
  // explanation rather than inviting attempts that cannot succeed.
  const closed = reason === "expired" || reason === "not-started" || reason === "suspended" || reason === "not-found";
  view.code.disabled = closed;
  view.label.disabled = closed;
  view.joinButton.disabled = closed;

  show(view.gate);
  if (!closed) view.code.focus();
}

async function join(event) {
  event.preventDefault();
  const dictionary = words();
  view.gateError.textContent = "";

  // Checked here as well as on the server, because the name is now the thing
  // that makes a second sitting possible and finding that out after a round trip
  // is a worse way to learn it. The rule is the server's rule: what matters is
  // what survives folding, so a field holding only punctuation is empty.
  if (
    view.label.value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim().length < 2
  ) {
    view.gateError.textContent = dictionary.missingName;
    view.label.focus();
    return;
  }

  view.joinButton.disabled = true;
  view.joinButton.textContent = dictionary.joining;

  try {
    const response = await fetch(JOIN_ENDPOINT, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: readSlug(), code: view.code.value, label: view.label.value }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      view.gateError.textContent = reasonMessage(payload.reason);
      return;
    }

    // A link that carried ?next= came from a facilitator pointing the room at
    // one specific simulator, so that is where the code screen hands them off.
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && /^\/[a-z0-9/_-]*$/i.test(next)) {
      window.location.assign(next);
      return;
    }

    await enterHub({ joined: true, role: payload.role, space: payload.space, label: payload.label });
  } catch (error) {
    console.warn("Join failed", error);
    view.gateError.textContent = dictionary.unavailable;
  } finally {
    view.joinButton.disabled = false;
    view.joinButton.textContent = dictionary.joinButton;
  }
}

/* -------------------------------------------------------------------------
 * Hub
 * ---------------------------------------------------------------------- */

/**
 * One card per simulator, each carrying the current leader of this space.
 *
 * The leader line is the cheapest possible demonstration of what the client is
 * paying for: the name in it is one of their own colleagues, on a board nobody
 * outside the space can see. It is fetched per card and failure is silent —
 * a card with no leader line is still a card that opens the simulator.
 */
function renderCards(space, progress) {
  const dictionary = words();
  view.hubCards.replaceChildren();

  const played = new Map((progress || []).map((entry) => [entry.simulator, entry]));

  for (const simulator of SIMULATORS) {
    const card = element("article", "workspace-card");
    card.append(element("h2", null, simulator.name[locale] || simulator.name.en));
    card.append(element("p", null, simulator.summary[locale] || simulator.summary.en));

    // Done or still owed, for this person rather than for this browser. A run is
    // one sitting from start to finish -- there is no half-finished attempt to
    // resume -- so what a returning participant needs is not a saved position
    // but an honest answer to "which of these three do I still have to do".
    const mine = played.get(simulator.slug);
    const status = element(
      "p",
      `workspace-card__status${mine ? " workspace-card__status--done" : ""}`,
      mine ? dictionary.statusDone : dictionary.statusPending,
    );
    if (mine) {
      status.append(
        element("span", "workspace-card__status-detail", ` · ${dictionary.yourScore} ${mine.bestScore}/${simulator.maxScore}`),
      );
    }
    card.append(status);

    const foot = element("div", "workspace-card__foot");
    const open = element("a", "workspace-button", mine ? dictionary.playAgain : dictionary.open);
    // The space is carried in the link so a participant who lost their seat is
    // sent back to this gate rather than into a public leaderboard.
    open.href = `/simulators/${locale}/${simulator.slug}/?space=${encodeURIComponent(space.slug)}`;
    foot.append(open);

    const leader = element("span", "workspace-card__stat", "");
    foot.append(leader);
    card.append(foot);
    view.hubCards.append(card);

    fetch(`${SCORES_ENDPOINT}?simulator=${encodeURIComponent(simulator.slug)}&limit=1&space=${encodeURIComponent(space.slug)}`, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const top = data && Array.isArray(data.scores) ? data.scores[0] : null;
        leader.textContent = top
          ? `${dictionary.leaderIs} ${top.name} — ${top.score}`
          : dictionary.noRunsYet;
      })
      .catch(() => {
        /* A missing leader line is not worth a message. */
      });
  }
}

function renderMeta(state) {
  const dictionary = words();
  view.hubMeta.replaceChildren();

  const role = element(
    "span",
    "workspace-pill workspace-pill--accent",
    state.role === "sponsor" ? dictionary.sponsorSeat : dictionary.participantSeat,
  );
  view.hubMeta.append(role);

  if (state.label) {
    view.hubMeta.append(element("span", "workspace-pill", `${dictionary.seatedAs} ${state.label}`));
  }

  const until = formatDate(state.space.expiresAt);
  if (until) view.hubMeta.append(element("span", "workspace-pill", `${dictionary.accessUntil} ${until}`));
}

/**
 * This participant's finished simulators, or an empty list.
 *
 * Asked for separately only when the caller has not already been handed it: the
 * page load asks the session endpoint for `progress=1` and pays nothing extra,
 * while somebody who has just typed a code arrives here without it and is worth
 * one small request -- a returning participant who rejoins under the same name
 * has progress from yesterday, and showing them three untouched cards would be
 * the exact confusion this is meant to remove.
 */
async function fetchProgress() {
  try {
    const response = await fetch(`${SESSION_ENDPOINT}?progress=1`, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.progress) ? data.progress : [];
  } catch (error) {
    // A hub with no status pills is still a working hub.
    console.warn("Progress unavailable", error);
    return [];
  }
}

/** The one-line summary under the cards: nothing yet, some, or all three. */
function progressSentence(progress) {
  const dictionary = words();
  const done = progress.length;
  const total = SIMULATORS.length;
  if (!done) return dictionary.progressNone;
  if (done >= total) return fill(dictionary.progressAll, { done, total });
  return fill(dictionary.progressSome, { done, total });
}

async function enterHub(state) {
  if (state.space.locale && COPY[state.space.locale]) locale = state.space.locale;
  applyCopy();
  renderClientBadge(state.space);

  view.hubTitle.textContent = state.space.displayName || state.space.company;
  renderMeta(state);

  const progress = Array.isArray(state.progress) ? state.progress : await fetchProgress();
  renderCards(state.space, progress);
  view.hubFoot.textContent = progressSentence(progress);
  show(view.hub);

  if (state.role === "sponsor") await renderReport();
}

/* -------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------- */

function metric(value, label) {
  const node = element("div", "workspace-metric");
  node.append(element("strong", null, String(value)));
  node.append(element("span", null, label));
  return node;
}

/**
 * One labelled bar.
 *
 * `valueText` overrides the percentage in the right-hand column, which is how a
 * ten-scenario ownership row reads "1/2" -- the two people who answered it, one
 * of whom got it right -- while the bar itself still shows the same 50%.
 */
function bar(label, value, weak, valueText) {
  const row = element("div", `workspace-bar${weak ? " workspace-bar--weak" : ""}`);
  row.append(element("span", "workspace-bar__label", label));
  const track = element("div", "workspace-bar__track");
  const fill = element("span", "workspace-bar__fill");
  fill.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
  track.append(fill);
  row.append(track);
  row.append(element("span", "workspace-bar__value", valueText ?? `${value}%`));
  return row;
}

/** A list of names as the space's language joins them. */
function listOf(items) {
  try {
    return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

/** A paragraph, skipped entirely when there is no sentence to put in it. */
function note(className, text) {
  return text ? element("p", className, text) : null;
}

/**
 * The room-level equivalent of the report a player gets on their own results
 * screen.
 *
 * A player finishes and reads a profile, a strengths list, a weaknesses list and
 * a set of next steps. A sponsor used to get the same numbers with none of the
 * reading: five bars and a table, and the work of turning that into a finding
 * left to them. So this panel now carries the room's own profile on the
 * simulator's own scale, the same strength/gap split at the same threshold the
 * results screens use, and -- for the ownership simulator, whose ten disputes
 * have no dimensions to average -- accuracy by the role that should have owned
 * each decision, which is the reading that actually explains the score.
 */
function renderSimulatorPanel(entry, thresholds) {
  const dictionary = words();
  const strength = thresholds.strength;
  const panel = element("section", "workspace-panel");
  panel.append(element("h3", null, simulatorName(entry.simulator)));

  // The verdict first, in the words the room's own players read.
  const profiles = (PROFILE_LABELS[locale] || PROFILE_LABELS.en)[entry.simulator] || {};
  const narratives = dictionary.roomBands[entry.simulator] || {};
  if (entry.bandKey && profiles[entry.bandKey]) {
    const verdict = element("p", "workspace-verdict");
    verdict.append(element("strong", null, `${dictionary.roomProfile}: ${profiles[entry.bandKey]}`));
    if (narratives[entry.bandKey]) verdict.append(element("span", null, ` ${narratives[entry.bandKey]}`));
    panel.append(verdict);
  }

  const summary = element("div", "workspace-summary");
  summary.append(metric(entry.runs, dictionary.runs));
  summary.append(metric(entry.participants, dictionary.people));
  summary.append(
    metric(entry.maxScore ? `${entry.averageScore}/${entry.maxScore}` : entry.averageScore, dictionary.averageScore),
  );
  summary.append(
    metric(entry.maxScore ? `${entry.bestScore}/${entry.maxScore}` : entry.bestScore, dictionary.bestScore),
  );
  summary.append(metric(formatDuration(entry.medianDurationMs), dictionary.medianTime));
  panel.append(summary);

  if (entry.bands && entry.bands.length) {
    panel.append(element("h4", null, dictionary.distribution));
    const bands = element("div", "workspace-bars");
    const total = entry.bands.reduce((sum, band) => sum + band.count, 0) || 1;
    for (const band of entry.bands) {
      const row = element("div", "workspace-bar");
      row.append(element("span", "workspace-bar__label", BAND_LABELS[locale][band.key] || band.key));
      const track = element("div", "workspace-bar__track");
      const fill = element("span", "workspace-bar__fill");
      fill.style.width = `${Math.round((band.count / total) * 100)}%`;
      track.append(fill);
      row.append(track);
      row.append(element("span", "workspace-bar__value", String(band.count)));
      bands.append(row);
    }
    panel.append(bands);
  }

  if (entry.dimensions && entry.dimensions.length) {
    // The ownership simulator's keys are ten disputes, each either called right
    // or called wrong, so they are neither dimensions nor averages -- and the
    // strength/gap split below would only re-list all ten rows the reader has
    // just read. Its role breakdown is the summary that belongs there instead.
    const perQuestion = entry.dimensions.every((dimension) => dimension.correctRuns !== null);
    panel.append(element("h4", null, perQuestion ? dictionary.weakestScenarios : dictionary.weakest));
    const bars = element("div", "workspace-bars");
    for (const dimension of entry.dimensions) {
      // Every gap is marked, not just the first row: a room with four
      // dimensions under the line has four problems, and highlighting only the
      // worst one implied the other three were fine.
      bars.append(
        bar(
          dimensionLabel(entry.simulator, dimension.key),
          dimension.average,
          !dimension.strong,
          dimension.correctRuns === null ? undefined : `${dimension.correctRuns}/${dimension.runs}`,
        ),
      );
    }
    panel.append(bars);

    // The same split the results screens draw, in words rather than a second
    // chart: named dimensions a facilitator can read out loud.
    if (!perQuestion) {
      const strong = entry.dimensions.filter((dimension) => dimension.strong);
      const weak = entry.dimensions.filter((dimension) => !dimension.strong);
      const split = element("div", "workspace-split");
      split.append(
        splitColumn(
          dictionary.strengths,
          strong.map((dimension) => dimensionLabel(entry.simulator, dimension.key)),
          fill(dictionary.noStrengths, { threshold: strength }),
        ),
      );
      split.append(
        splitColumn(
          dictionary.gaps,
          weak.map((dimension) => dimensionLabel(entry.simulator, dimension.key)),
          fill(dictionary.noGaps, { threshold: strength }),
        ),
      );
      panel.append(split);
    }

    const weakest = entry.dimensions[0];
    panel.append(
      element(
        "p",
        "workspace-footnote",
        `${fill(dictionary.focusNote, {
          dimension: dimensionLabel(entry.simulator, weakest.key),
          value: weakest.average,
        })} ${dictionary.weakestNote}`,
      ),
    );
  }

  if (entry.roles && entry.roles.length) {
    panel.append(element("h4", null, dictionary.rolesTitle));
    const bars = element("div", "workspace-bars");
    for (const role of entry.roles) {
      const labels = ROLE_LABELS[locale] || ROLE_LABELS.en;
      bars.append(bar(labels[role.key] || role.key, role.average, role.average < strength));
    }
    panel.append(bars);
    panel.append(element("p", "workspace-footnote", dictionary.rolesNote));
  }

  // How much the room agreed with itself, which decides whether the average
  // above is a finding or an artefact of two groups pulling in opposite
  // directions.
  const consensus =
    entry.runs < 2
      ? dictionary.singleRun
      : entry.spreadPercent === null
        ? ""
        : fill(entry.spreadPercent >= 30 ? dictionary.consensusSplit : dictionary.consensusTight, {
            spread: entry.spreadPercent,
          });
  const consensusNode = note("workspace-footnote", consensus);
  if (consensusNode) panel.append(consensusNode);

  return panel;
}

/** One side of the strengths/gaps split, or the sentence for an empty side. */
function splitColumn(title, items, emptyText) {
  const column = element("div", "workspace-split__column");
  column.append(element("h5", null, title));
  if (!items.length) {
    column.append(element("p", "workspace-split__empty", emptyText));
    return column;
  }
  const list = element("ul", "workspace-split__list");
  for (const item of items) list.append(element("li", null, item));
  column.append(list);
  return column;
}

/**
 * The executive summary: the whole engagement as one index, one standing and the
 * five maturity pillars.
 *
 * The pillars are the reason this is worth more than an average of averages.
 * Each simulator sees part of the same five-pillar model -- Day-to-Day covers
 * foundations, metadata, security and quality, Literacy is the only one that
 * reads culture, Ownership tests accountability across all four technical ones
 * -- so pooling them produces a reading no single exercise can give, and saying
 * which pillar nothing has measured yet is as useful to a sponsor as the scores.
 */
function renderExecutive(data) {
  const dictionary = words();
  const executive = data.executive;
  const panel = element("section", "workspace-panel workspace-panel--executive");
  panel.append(element("h3", null, dictionary.executiveTitle));

  const bandLabel = executive.bandKey ? BAND_LABELS[locale][executive.bandKey] || executive.bandKey : "—";
  const summary = element("div", "workspace-summary");
  summary.append(metric(executive.index === null ? "—" : `${executive.index}/100`, dictionary.executiveIndex));
  summary.append(metric(bandLabel, dictionary.executiveStanding));
  summary.append(
    metric(`${executive.simulatorsCounted}/${executive.simulatorsAvailable}`, dictionary.executiveCovered),
  );
  summary.append(metric(executive.coverage.people, dictionary.people));
  panel.append(summary);

  // A room that has played one simulator gets a sentence that says so, rather
  // than an index presented as if it covered the whole picture.
  const partial = executive.simulatorsCounted < executive.simulatorsAvailable;
  panel.append(
    element(
      "p",
      "workspace-lead",
      fill(partial ? dictionary.executiveOne : dictionary.executiveLead, {
        people: executive.coverage.people,
        runs: data.totals.runs,
        counted: executive.simulatorsCounted,
        available: executive.simulatorsAvailable,
        index: executive.index === null ? "—" : executive.index,
        band: bandLabel,
      }),
    ),
  );

  panel.append(element("h4", null, dictionary.pillarsTitle));
  const bars = element("div", "workspace-bars");
  const pillarNames = PILLAR_LABELS[locale] || PILLAR_LABELS.en;
  for (const pillar of executive.pillars) {
    bars.append(
      bar(
        pillarNames[pillar.key] || pillar.key,
        pillar.measured ? pillar.average : 0,
        pillar.measured && pillar.key === executive.weakestPillar,
        pillar.measured ? undefined : "—",
      ),
    );
  }
  panel.append(bars);
  panel.append(element("p", "workspace-footnote", dictionary.pillarsNote));

  const named = (key) => {
    const pillar = executive.pillars.find((candidate) => candidate.key === key);
    return pillar ? { pillar: pillarNames[key] || key, value: pillar.average } : null;
  };
  const strongest = named(executive.strongestPillar);
  const weakest = named(executive.weakestPillar);
  const readings = [
    strongest ? fill(dictionary.pillarStrongest, strongest) : "",
    // Only worth saying separately when it is a different pillar; with one
    // measured pillar the strongest and the weakest are the same row.
    weakest && executive.weakestPillar !== executive.strongestPillar ? fill(dictionary.pillarWeakest, weakest) : "",
  ]
    .filter(Boolean)
    .join(" ");
  const readingsNode = note("workspace-lead", readings);
  if (readingsNode) panel.append(readingsNode);

  if (executive.unmeasuredPillars.length) {
    // Which simulator would fill the hole, not just that there is one.
    const wanted = new Set();
    for (const key of executive.unmeasuredPillars) {
      const pillar = executive.pillars.find((candidate) => candidate.key === key);
      for (const source of pillar ? pillar.sources : []) wanted.add(source);
    }
    panel.append(
      element(
        "p",
        "workspace-footnote",
        fill(dictionary.pillarUnmeasured, {
          pillars: listOf(executive.unmeasuredPillars.map((key) => pillarNames[key] || key)),
          simulators: listOf([...wanted].map(simulatorName)),
        }),
      ),
    );
  }

  const notes = element("ul", "workspace-notes");
  const sentences = [
    executive.coverage.playedAll
      ? fill(dictionary.coverageAll, {
          count: executive.coverage.playedAll,
          people: executive.coverage.people,
          available: executive.simulatorsAvailable,
        })
      : executive.coverage.playedOne
        ? fill(dictionary.coveragePartial, {
            count: executive.coverage.playedOne,
            people: executive.coverage.people,
          })
        : "",
    executive.widestSpread
      ? fill(dictionary.spreadNote, {
          simulator: simulatorName(executive.widestSpread.simulator),
          min: executive.widestSpread.minPercent,
          max: executive.widestSpread.maxPercent,
        })
      : "",
    // The report says how much weight its own numbers carry. A confident index
    // built from three runs is the one way this report could mislead a client.
    executive.confidence === "baseline"
      ? fill(dictionary.confidenceBaseline, { needed: data.thresholds.baselineParticipants })
      : fill(dictionary.confidenceIndicative, {
          count: executive.smallestGroup,
          needed: data.thresholds.baselineParticipants,
        }),
  ].filter(Boolean);
  for (const sentence of sentences) notes.append(element("li", null, sentence));
  if (sentences.length) panel.append(notes);

  return panel;
}

async function renderReport() {
  const dictionary = words();
  view.report.hidden = false;
  view.reportBody.replaceChildren(element("p", "workspace-state", dictionary.loading));

  try {
    const response = await fetch(REPORT_ENDPOINT, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      // A participant seat, or a seat that has since ended. Neither is an error
      // worth explaining twice, and the section simply goes away.
      view.report.hidden = true;
      return;
    }

    const data = await response.json();

    view.reportSummary.replaceChildren(
      metric(data.totals.runs, dictionary.runs),
      metric(data.totals.participants, dictionary.people),
      metric(data.totals.simulatorsPlayed, dictionary.simulatorsPlayed),
      metric(data.seats.people ?? data.seats.total, dictionary.peopleJoined),
      metric(data.seats.total, dictionary.seatsOpened),
    );

    if (!data.simulators.length) {
      view.reportBody.replaceChildren(element("p", "workspace-state", dictionary.reportEmpty));
      view.reportFoot.textContent = "";
      return;
    }

    // The executive summary first: it is the page a sponsor forwards, and the
    // per-simulator panels underneath are the evidence for it.
    view.reportBody.replaceChildren(
      renderExecutive(data),
      ...data.simulators.map((entry) => renderSimulatorPanel(entry, data.thresholds)),
    );
    view.reportFoot.textContent = [
      `${dictionary.generated} ${formatDate(new Date().toISOString())}`,
      data.truncated ? dictionary.reportTruncated : "",
    ]
      .filter(Boolean)
      .join(" · ");
  } catch (error) {
    console.warn("Report unavailable", error);
    view.reportBody.replaceChildren(element("p", "workspace-state", dictionary.unavailable));
  }
}

/* -------------------------------------------------------------------------
 * Boot
 * ---------------------------------------------------------------------- */

view.gateForm.addEventListener("submit", join);
view.reportPrint.addEventListener("click", () => window.print());
view.reportCsv.addEventListener("click", () => {
  // A plain navigation rather than a fetch and a blob: the response carries the
  // filename in Content-Disposition, and letting the browser handle it keeps the
  // export working on a phone, where a generated object URL often does not.
  window.location.assign(`${REPORT_ENDPOINT}?format=csv`);
});

const slug = readSlug();

try {
  // progress=1 on the very first request, so a returning participant's cards are
  // right on first paint rather than after a second round trip.
  const response = await fetch(
    slug ? `${SESSION_ENDPOINT}?progress=1&slug=${encodeURIComponent(slug)}` : `${SESSION_ENDPOINT}?progress=1`,
    { credentials: "same-origin", headers: { Accept: "application/json" } },
  );
  const data = await response.json();

  if (data.joined && data.space) {
    await enterHub(data);
  } else if (data.reason === "other-space") {
    // Seated somewhere else. Offer the one action that resolves it rather than
    // silently swapping spaces underneath somebody mid-workshop.
    renderGate(data.space, null);
    view.gateError.textContent = words().switchSpace;
    const leave = element("button", "workspace-button workspace-button--ghost", words().leaveAndSwitch);
    leave.type = "button";
    leave.addEventListener("click", async () => {
      await fetch(SESSION_ENDPOINT, { method: "DELETE", credentials: "same-origin" }).catch(() => {});
      window.location.reload();
    });
    view.gateError.after(leave);
  } else {
    renderGate(data.space, slug ? data.reason : "not-found");
  }
} catch (error) {
  console.warn("Space lookup failed", error);
  renderGate(null, "unavailable");
}
