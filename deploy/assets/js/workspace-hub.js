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
 */

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
    nameLabel: "Your name on the leaderboard (optional)",
    nameHint: "Shown to your colleagues in this space only. Never an email address.",
    joinButton: "Enter the space",
    joining: "Checking…",
    hubLead:
      "Your organisation's simulators and leaderboards. Scores published here stay inside this space.",
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
    averageScore: "Average score",
    bestScore: "Best score",
    medianTime: "Median time",
    distribution: "Score distribution",
    weakest: "Weakest dimensions first",
    weakestNote: "The top row is where a follow-up session should start.",
    dimension: "Dimension",
    average: "Average",
    runsCounted: "Runs",
    generated: "Generated",
    bands: {
      developing: "Developing",
      competent: "Competent",
      strong: "Strong",
      leading: "Leading",
    },
    dimensions: {
      efficiency: "Efficiency",
      trust: "Trust",
      accountability: "Accountability",
      security: "Security",
      context: "Context",
      governance: "Governance",
      bias: "Bias awareness",
      ai: "AI and automation",
      analytics: "Analytics",
      culture: "Data culture",
    },
    scenario: "Scenario",
  },
  es: {
    loading: "Comprobando tu acceso…",
    gateEyebrow: "Espacio privado",
    gateTitle: "Introduce tu código de acceso",
    gateLead:
      "Tu facilitador te dará el código de esta sesión. Solo abre los simuladores y la clasificación de esta empresa.",
    codeLabel: "Código de acceso",
    codeHint: "Los guiones y las mayúsculas no importan.",
    nameLabel: "Tu nombre en la clasificación (opcional)",
    nameHint: "Visible solo para tus colegas de este espacio. Nunca un correo electrónico.",
    joinButton: "Entrar al espacio",
    joining: "Comprobando…",
    hubLead:
      "Los simuladores y las clasificaciones de tu organización. Las puntuaciones publicadas aquí no salen de este espacio.",
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
    averageScore: "Puntuación media",
    bestScore: "Mejor puntuación",
    medianTime: "Tiempo mediano",
    distribution: "Distribución de puntuaciones",
    weakest: "Dimensiones más débiles primero",
    weakestNote: "La primera fila es por donde debería empezar la siguiente sesión.",
    dimension: "Dimensión",
    average: "Media",
    runsCounted: "Partidas",
    generated: "Generado",
    bands: {
      developing: "En desarrollo",
      competent: "Competente",
      strong: "Sólido",
      leading: "Referente",
    },
    dimensions: {
      efficiency: "Eficiencia",
      trust: "Confianza",
      accountability: "Responsabilidad",
      security: "Seguridad",
      context: "Contexto",
      governance: "Gobernanza",
      bias: "Conciencia del sesgo",
      ai: "IA y automatización",
      analytics: "Analítica",
      culture: "Cultura de datos",
    },
    scenario: "Escenario",
  },
  pt: {
    loading: "A verificar o seu acesso…",
    gateEyebrow: "Espaço privado",
    gateTitle: "Introduza o seu código de acesso",
    gateLead:
      "O seu facilitador dará o código desta sessão. Ele abre apenas os simuladores e o ranking desta empresa.",
    codeLabel: "Código de acesso",
    codeHint: "Hífens e maiúsculas não importam.",
    nameLabel: "O seu nome no ranking (opcional)",
    nameHint: "Visível apenas para os colegas deste espaço. Nunca um e-mail.",
    joinButton: "Entrar no espaço",
    joining: "A verificar…",
    hubLead:
      "Os simuladores e rankings da sua organização. As pontuações publicadas aqui não saem deste espaço.",
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
    averageScore: "Pontuação média",
    bestScore: "Melhor pontuação",
    medianTime: "Tempo mediano",
    distribution: "Distribuição das pontuações",
    weakest: "Dimensões mais fracas primeiro",
    weakestNote: "A primeira linha é por onde a próxima sessão deve começar.",
    dimension: "Dimensão",
    average: "Média",
    runsCounted: "Partidas",
    generated: "Gerado",
    bands: {
      developing: "Em desenvolvimento",
      competent: "Competente",
      strong: "Sólido",
      leading: "Referência",
    },
    dimensions: {
      efficiency: "Eficiência",
      trust: "Confiança",
      accountability: "Responsabilidade",
      security: "Segurança",
      context: "Contexto",
      governance: "Governança",
      bias: "Consciência do viés",
      ai: "IA e automação",
      analytics: "Analítica",
      culture: "Cultura de dados",
    },
    scenario: "Cenário",
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
  const value = Number(ms);
  if (!Number.isFinite(value) || value < 0) return "—";
  const totalSeconds = Math.round(value / 1000);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${Math.floor(totalSeconds / 60)}:${seconds}`;
}

/** A dimension key as a person reads it: a known label, or the key tidied up. */
function dimensionLabel(key) {
  const dictionary = words();
  if (dictionary.dimensions[key]) return dictionary.dimensions[key];
  const scenario = /^(?:q|scenario)-(\d+)$/.exec(key);
  if (scenario) return `${dictionary.scenario} ${scenario[1]}`;
  return key.replace(/[-_]+/g, " ").replace(/^./, (character) => character.toUpperCase());
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
function renderCards(space) {
  const dictionary = words();
  view.hubCards.replaceChildren();

  for (const simulator of SIMULATORS) {
    const card = element("article", "workspace-card");
    card.append(element("h2", null, simulator.name[locale] || simulator.name.en));
    card.append(element("p", null, simulator.summary[locale] || simulator.summary.en));

    const foot = element("div", "workspace-card__foot");
    const open = element("a", "workspace-button", dictionary.open);
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

async function enterHub(state) {
  if (state.space.locale && COPY[state.space.locale]) locale = state.space.locale;
  applyCopy();
  renderClientBadge(state.space);

  view.hubTitle.textContent = state.space.displayName || state.space.company;
  renderMeta(state);
  renderCards(state.space);
  view.hubFoot.textContent = "";
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

function bar(label, value, weak) {
  const row = element("div", `workspace-bar${weak ? " workspace-bar--weak" : ""}`);
  row.append(element("span", "workspace-bar__label", label));
  const track = element("div", "workspace-bar__track");
  const fill = element("span", "workspace-bar__fill");
  fill.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
  track.append(fill);
  row.append(track);
  row.append(element("span", "workspace-bar__value", `${value}%`));
  return row;
}

function renderSimulatorPanel(entry) {
  const dictionary = words();
  const panel = element("section", "workspace-panel");
  panel.append(element("h3", null, simulatorName(entry.simulator)));

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
      row.append(element("span", "workspace-bar__label", dictionary.bands[band.key] || band.key));
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
    panel.append(element("h4", null, dictionary.weakest));
    const bars = element("div", "workspace-bars");
    entry.dimensions.forEach((dimension, index) => {
      bars.append(bar(dimensionLabel(dimension.key), dimension.average, index === 0));
    });
    panel.append(bars);
    panel.append(element("p", "workspace-footnote", dictionary.weakestNote));
  }

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
      metric(data.seats.total, dictionary.seatsOpened),
    );

    if (!data.simulators.length) {
      view.reportBody.replaceChildren(element("p", "workspace-state", dictionary.reportEmpty));
      view.reportFoot.textContent = "";
      return;
    }

    view.reportBody.replaceChildren(...data.simulators.map(renderSimulatorPanel));
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
  const response = await fetch(
    slug ? `${SESSION_ENDPOINT}?slug=${encodeURIComponent(slug)}` : SESSION_ENDPOINT,
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
