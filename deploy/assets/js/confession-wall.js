const locale = document.body.dataset.locale || "en";

const content = {
  en: {
    localeTag: "en-US",
    home: "Back to main website",
    eyebrow: "Real data failures. Practical governance lessons.",
    titleLead: "The Data Governance",
    titleAccent: "Confession Wall",
    lead: "Anonymous stories about costly data mistakes, the organizational chaos they caused, and the governance practices that could have changed the outcome.",
    submit: "Submit a confession",
    guidanceTitle: "Practical governance guidance",
    expertCaption: "Each approved story includes clear actions that can help prevent the same failure.",
    sectionTitle: "Confessions worth learning from",
    sectionLead: "Explore real experiences shared by data professionals. Company names and identifying details are removed before publication.",
    count: "published stories",
    search: "Search data disasters…",
    all: "All",
    categories: ["Finance", "Engineering", "Marketing", "People & Operations"],
    expertLabel: "Governance guidance",
    noResults: "No confessions match this search yet.",
    modalTitle: "Share your data disaster",
    modalLead: "Your submission stays private until it is reviewed and practical guidance is added.",
    roleLabel: "Role or sector (optional)",
    rolePlaceholder: "Senior Financial Analyst | Retail",
    categoryLabel: "Category",
    titleLabel: "Story title",
    titlePlaceholder: "The spreadsheet error that changed our quarterly results",
    storyLabel: "What happened?",
    storyPlaceholder: "Describe what went wrong, the impact, and what your team learned…",
    privacy: "Anonymous by design. Do not include company names, personal names, credentials, or other identifying information.",
    cancel: "Cancel",
    sending: "Submitting…",
    submitForm: "Submit anonymously",
    success: "Your confession was registered and is waiting for review.",
    assessmentEyebrow: "Take the next step",
    assessmentTitle: "Discover your data maturity level",
    assessmentLead: "Complete the Maturity Scorecard to identify your current strengths, gaps, and most valuable governance priorities.",
    assessmentButton: "Open the Maturity Scorecard",
    failure: "We could not register your confession. Please try again.",
    footer: "Practical data governance, culture, and enablement.",
    copyright: "All rights reserved.",
    defaultStories: [
      {
        category: "Finance",
        role: "Senior Financial Analyst | Retail",
        title: "Two different revenue numbers reached the board",
        story: "Finance reported processed orders while Operations excluded returns and unsynchronized cancellations. Both teams used separate spreadsheet queries, and no one owned a single definition of net revenue.",
        expertComment: "Define critical metrics once in a governed business glossary, assign an accountable owner, and require executive reporting to use the same certified source.",
      },
      {
        category: "Engineering",
        role: "Data Engineer | SaaS",
        title: "A staging cleanup script reached production",
        story: "A debugging script pointed to the production database and removed active subscription records. Recovery required hours of downtime and a backup that did not include the latest transactions.",
        expertComment: "Separate credentials and network access by environment, require destructive-query safeguards, and test recovery procedures before an emergency exposes the gaps.",
      },
      {
        category: "People & Operations",
        role: "People Operations Specialist | Healthcare",
        title: "Executive salaries were left in a shared folder",
        story: "A compensation spreadsheet was stored in an unrestricted shared folder for weeks. The file spread internally and triggered resignations, distrust, and an urgent privacy investigation.",
        expertComment: "Classify sensitive data at creation, apply least-privilege access automatically, and audit shared repositories continuously instead of relying on manual cleanup.",
      },
    ],
  },
  es: {
    localeTag: "es-ES",
    home: "Volver al sitio principal",
    eyebrow: "Fallos reales de datos. Lecciones prácticas de gobierno.",
    titleLead: "El Muro de Confesiones de",
    titleAccent: "Gobierno de Datos",
    lead: "Historias anónimas sobre errores costosos con datos, el caos organizacional que provocaron y las prácticas de gobierno que podrían haber cambiado el resultado.",
    submit: "Enviar una confesión",
    guidanceTitle: "Orientación práctica de gobierno",
    expertCaption: "Cada historia aprobada incluye acciones claras que pueden ayudar a prevenir el mismo fallo.",
    sectionTitle: "Confesiones de las que vale la pena aprender",
    sectionLead: "Descubre experiencias reales compartidas por profesionales de datos. Los nombres de empresas y detalles identificables se eliminan antes de publicar.",
    count: "historias publicadas",
    search: "Buscar desastres de datos…",
    all: "Todas",
    categories: ["Finanzas", "Ingeniería", "Marketing", "Personas y Operaciones"],
    expertLabel: "Recomendación de gobierno",
    noResults: "Todavía no hay confesiones que coincidan con esta búsqueda.",
    modalTitle: "Comparte tu desastre con datos",
    modalLead: "Tu historia permanece privada hasta que sea revisada y se añada una recomendación práctica.",
    roleLabel: "Cargo o sector (opcional)",
    rolePlaceholder: "Analista Financiero Senior | Retail",
    categoryLabel: "Categoría",
    titleLabel: "Título de la historia",
    titlePlaceholder: "El error de Excel que cambió nuestros resultados trimestrales",
    storyLabel: "¿Qué ocurrió?",
    storyPlaceholder: "Describe qué salió mal, el impacto y lo que aprendió tu equipo…",
    privacy: "Diseñado para ser anónimo. No incluyas nombres de empresas, personas, credenciales ni otra información identificable.",
    cancel: "Cancelar",
    sending: "Enviando…",
    submitForm: "Enviar anónimamente",
    success: "Tu confesión fue registrada y está esperando revisión.",
    assessmentEyebrow: "Da el siguiente paso",
    assessmentTitle: "Descubre tu nivel de madurez de datos",
    assessmentLead: "Completa el Scorecard de Madurez para identificar tus fortalezas, brechas y prioridades de gobierno más valiosas.",
    assessmentButton: "Abrir el Scorecard de Madurez",
    failure: "No pudimos registrar tu confesión. Inténtalo de nuevo.",
    footer: "Gobierno, cultura y habilitación de datos de forma práctica.",
    copyright: "Todos los derechos reservados.",
    defaultStories: [
      {
        category: "Finanzas",
        role: "Analista Financiero Senior | Retail",
        title: "Dos cifras de ingresos distintas llegaron al consejo",
        story: "Finanzas reportaba pedidos procesados mientras Operaciones descontaba devoluciones y cancelaciones no sincronizadas. Ambos equipos usaban consultas separadas y nadie era responsable de una definición única de ingresos netos.",
        expertComment: "Define las métricas críticas una sola vez en un glosario de negocio gobernado, asigna un responsable y exige que los informes ejecutivos utilicen la misma fuente certificada.",
      },
      {
        category: "Ingeniería",
        role: "Ingeniero de Datos | SaaS",
        title: "Un script de limpieza de pruebas llegó a producción",
        story: "Un script de depuración apuntó a la base de producción y eliminó suscripciones activas. La recuperación exigió horas de interrupción y un respaldo que no incluía las transacciones más recientes.",
        expertComment: "Separa credenciales y accesos por entorno, incorpora protecciones para consultas destructivas y prueba la recuperación antes de que una emergencia revele las brechas.",
      },
      {
        category: "Personas y Operaciones",
        role: "Especialista de Operaciones de Personas | Salud",
        title: "Los salarios ejecutivos quedaron en una carpeta compartida",
        story: "Una hoja de compensaciones permaneció durante semanas en una carpeta sin restricciones. El archivo circuló internamente y provocó renuncias, desconfianza y una investigación urgente de privacidad.",
        expertComment: "Clasifica los datos sensibles desde su creación, aplica acceso de mínimo privilegio automáticamente y audita los repositorios compartidos de forma continua.",
      },
    ],
  },
  pt: {
    localeTag: "pt-BR",
    home: "Voltar ao site principal",
    eyebrow: "Falhas reais de dados. Lições práticas de governança.",
    titleLead: "O Mural de Confissões de",
    titleAccent: "Governança de Dados",
    lead: "Histórias anônimas sobre erros caros com dados, o caos organizacional que causaram e as práticas de governança que poderiam ter mudado o resultado.",
    submit: "Enviar uma confissão",
    guidanceTitle: "Orientação prática de governança",
    expertCaption: "Cada história aprovada inclui ações claras que podem ajudar a evitar a mesma falha.",
    sectionTitle: "Confissões que merecem virar aprendizado",
    sectionLead: "Conheça experiências reais compartilhadas por profissionais de dados. Nomes de empresas e detalhes identificáveis são removidos antes da publicação.",
    count: "histórias publicadas",
    search: "Buscar desastres com dados…",
    all: "Todas",
    categories: ["Finanças", "Engenharia", "Marketing", "Pessoas e Operações"],
    expertLabel: "Orientação de governança",
    noResults: "Ainda não há confissões que correspondam a esta busca.",
    modalTitle: "Compartilhe seu desastre com dados",
    modalLead: "Sua história permanece privada até ser revisada e receber uma orientação prática.",
    roleLabel: "Cargo ou setor (opcional)",
    rolePlaceholder: "Analista Financeiro Sênior | Varejo",
    categoryLabel: "Categoria",
    titleLabel: "Título da história",
    titlePlaceholder: "O erro na planilha que mudou nossos resultados trimestrais",
    storyLabel: "O que aconteceu?",
    storyPlaceholder: "Descreva o que deu errado, o impacto e o que sua equipe aprendeu…",
    privacy: "Projetado para ser anônimo. Não inclua nomes de empresas, pessoas, credenciais ou outras informações identificáveis.",
    cancel: "Cancelar",
    sending: "Enviando…",
    submitForm: "Enviar anonimamente",
    success: "Sua confissão foi registrada e está aguardando revisão.",
    assessmentEyebrow: "Dê o próximo passo",
    assessmentTitle: "Descubra seu nível de maturidade de dados",
    assessmentLead: "Conclua o Scorecard de Maturidade para identificar seus pontos fortes, lacunas e prioridades de governança mais valiosas.",
    assessmentButton: "Abrir o Scorecard de Maturidade",
    failure: "Não foi possível registrar sua confissão. Tente novamente.",
    footer: "Governança, cultura e capacitação de dados de forma prática.",
    copyright: "Todos os direitos reservados.",
    defaultStories: [
      {
        category: "Finanças",
        role: "Analista Financeiro Sênior | Varejo",
        title: "Dois números de receita diferentes chegaram ao conselho",
        story: "Finanças reportava pedidos processados enquanto Operações descontava devoluções e cancelamentos não sincronizados. As equipes usavam consultas separadas e ninguém respondia por uma definição única de receita líquida.",
        expertComment: "Defina métricas críticas uma única vez em um glossário de negócios governado, atribua um responsável e exija que relatórios executivos usem a mesma fonte certificada.",
      },
      {
        category: "Engenharia",
        role: "Engenheiro de Dados | SaaS",
        title: "Um script de limpeza de testes chegou à produção",
        story: "Um script de depuração apontou para o banco de produção e removeu assinaturas ativas. A recuperação exigiu horas de indisponibilidade e um backup sem as transações mais recentes.",
        expertComment: "Separe credenciais e acessos por ambiente, adote proteções para consultas destrutivas e teste a recuperação antes que uma emergência exponha as lacunas.",
      },
      {
        category: "Pessoas e Operações",
        role: "Especialista de Operações de Pessoas | Saúde",
        title: "Os salários executivos ficaram em uma pasta compartilhada",
        story: "Uma planilha de remuneração permaneceu por semanas em uma pasta sem restrições. O arquivo circulou internamente e provocou demissões, desconfiança e uma investigação urgente de privacidade.",
        expertComment: "Classifique dados sensíveis na criação, aplique automaticamente o menor privilégio e audite repositórios compartilhados continuamente.",
      },
    ],
  },
};

const copy = content[locale] || content.en;
let stories = [...copy.defaultStories];
let activeCategory = copy.all;
let toastTimer;

const elements = {
  homeLink: document.querySelector("[data-copy='home']"),
  eyebrow: document.querySelector("[data-copy='eyebrow']"),
  titleLead: document.querySelector("[data-copy='titleLead']"),
  titleAccent: document.querySelector("[data-copy='titleAccent']"),
  lead: document.querySelector("[data-copy='lead']"),
  submitLabels: document.querySelectorAll("[data-copy='submit']"),
  expertCaption: document.querySelector("[data-copy='expertCaption']"),
  guidanceTitle: document.querySelector("[data-copy='guidanceTitle']"),
  sectionTitle: document.querySelector("[data-copy='sectionTitle']"),
  sectionLead: document.querySelector("[data-copy='sectionLead']"),
  count: document.querySelector("#wall-count"),
  search: document.querySelector("#wall-search-input"),
  filters: document.querySelector("#wall-filters"),
  grid: document.querySelector("#wall-grid"),
  modal: document.querySelector("#submission-modal"),
  form: document.querySelector("#confession-form"),
  formStatus: document.querySelector("#confession-form-status"),
  formSubmit: document.querySelector("#confession-form-submit"),
  category: document.querySelector("#confession-category"),
  toast: document.querySelector("#wall-toast"),
};

function applyCopy() {
  elements.homeLink.textContent = copy.home;
  elements.eyebrow.textContent = copy.eyebrow;
  elements.titleLead.textContent = copy.titleLead;
  elements.titleAccent.textContent = copy.titleAccent;
  elements.lead.textContent = copy.lead;
  elements.submitLabels.forEach((element) => { element.textContent = copy.submit; });
  elements.expertCaption.textContent = copy.expertCaption;
  elements.guidanceTitle.textContent = copy.guidanceTitle;
  elements.sectionTitle.textContent = copy.sectionTitle;
  elements.sectionLead.textContent = copy.sectionLead;
  elements.search.placeholder = copy.search;
  document.querySelector("#modal-title").textContent = copy.modalTitle;
  document.querySelector("#modal-lead").textContent = copy.modalLead;
  document.querySelector("[for='confession-role']").textContent = copy.roleLabel;
  document.querySelector("#confession-role").placeholder = copy.rolePlaceholder;
  document.querySelector("[for='confession-category']").textContent = copy.categoryLabel;
  document.querySelector("[for='confession-title']").textContent = copy.titleLabel;
  document.querySelector("#confession-title").placeholder = copy.titlePlaceholder;
  document.querySelector("[for='confession-story']").textContent = copy.storyLabel;
  document.querySelector("#confession-story").placeholder = copy.storyPlaceholder;
  document.querySelector("#privacy-copy").textContent = copy.privacy;
  document.querySelector("#confession-form-cancel").textContent = copy.cancel;
  elements.formSubmit.textContent = copy.submitForm;
  document.querySelector("#footer-copy").textContent = copy.footer;
  document.querySelector("#footer-rights").textContent = copy.copyright;
  document.querySelector("[data-copy='assessmentEyebrow']").textContent = copy.assessmentEyebrow;
  document.querySelector("[data-copy='assessmentTitle']").textContent = copy.assessmentTitle;
  document.querySelector("[data-copy='assessmentLead']").textContent = copy.assessmentLead;
  document.querySelector("[data-copy='assessmentButton']").textContent = copy.assessmentButton;

  elements.category.replaceChildren(...copy.categories.map((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    return option;
  }));

  const categories = [copy.all, ...copy.categories];
  elements.filters.replaceChildren(...categories.map((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `wall-filter${category === copy.all ? " is-active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      elements.filters.querySelectorAll(".wall-filter").forEach((filter) => filter.classList.remove("is-active"));
      button.classList.add("is-active");
      renderStories();
    });
    return button;
  }));
}

function createStoryCard(story) {
  const article = document.createElement("article");
  article.className = "confession-card";

  const body = document.createElement("div");
  body.className = "confession-card__body";

  const meta = document.createElement("div");
  meta.className = "confession-card__meta";

  const category = document.createElement("span");
  category.className = "confession-card__category";
  category.innerHTML = '<i class="fa-solid fa-tag" aria-hidden="true"></i>';
  category.append(document.createTextNode(story.category || copy.categories[0]));

  const date = document.createElement("span");
  date.className = "confession-card__date";
  date.textContent = story.publishedAt
    ? new Intl.DateTimeFormat(copy.localeTag, { dateStyle: "medium" }).format(new Date(story.publishedAt))
    : "";

  meta.append(category, date);

  const title = document.createElement("h3");
  title.textContent = story.title;

  const role = document.createElement("p");
  role.className = "confession-card__role";
  role.textContent = story.role;

  const storyText = document.createElement("p");
  storyText.className = "confession-card__story";
  storyText.textContent = story.story;

  body.append(meta, title, role, storyText);

  const takeaway = document.createElement("div");
  takeaway.className = "confession-card__takeaway";

  const takeawayLabel = document.createElement("div");
  takeawayLabel.className = "confession-card__takeaway-label";
  const guidanceIcon = document.createElement("i");
  guidanceIcon.className = "fa-solid fa-compass";
  guidanceIcon.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.textContent = copy.expertLabel;
  takeawayLabel.append(guidanceIcon, label);

  const comment = document.createElement("p");
  comment.textContent = story.expertComment;
  takeaway.append(takeawayLabel, comment);
  article.append(body, takeaway);
  return article;
}

function renderStories() {
  const searchTerm = elements.search.value.trim().toLocaleLowerCase(copy.localeTag);
  const filtered = stories.filter((story) => {
    const categoryMatch = activeCategory === copy.all || story.category === activeCategory;
    const searchable = `${story.title} ${story.role} ${story.story} ${story.expertComment}`.toLocaleLowerCase(copy.localeTag);
    return categoryMatch && (!searchTerm || searchable.includes(searchTerm));
  });

  elements.count.textContent = `${stories.length} ${copy.count}`;
  elements.grid.replaceChildren();

  if (!filtered.length) {
    const state = document.createElement("div");
    state.className = "wall-state";
    state.innerHTML = '<i class="fa-regular fa-message" aria-hidden="true"></i>';
    const message = document.createElement("span");
    message.textContent = copy.noResults;
    state.append(message);
    elements.grid.append(state);
    return;
  }

  elements.grid.append(...filtered.map(createStoryCard));
}

async function loadPublishedStories() {
  try {
    const response = await fetch(`/api/confessions?locale=${locale}`);
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.submissions)) {
      stories = [...payload.submissions, ...copy.defaultStories];
      renderStories();
    }
  } catch {
    renderStories();
  }
}

function openModal() {
  elements.formStatus.textContent = "";
  elements.modal.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => document.querySelector("#confession-title").focus());
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 4500);
}

document.querySelectorAll("[data-open-confession-form]").forEach((button) => button.addEventListener("click", openModal));
document.querySelectorAll("[data-close-confession-form]").forEach((button) => button.addEventListener("click", closeModal));
elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) closeModal();
});
elements.search.addEventListener("input", renderStories);

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.formStatus.textContent = "";
  elements.formSubmit.disabled = true;
  elements.formSubmit.textContent = copy.sending;

  const formData = new FormData(elements.form);
  const payload = {
    locale,
    role: String(formData.get("role") || "").trim() || (locale === "es" ? "Profesional Anónimo" : locale === "pt" ? "Profissional Anônimo" : "Anonymous Professional"),
    category: String(formData.get("category") || ""),
    title: String(formData.get("title") || "").trim(),
    story: String(formData.get("story") || "").trim(),
  };

  try {
    const response = await fetch("/api/confessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Submission failed");

    elements.form.reset();
    closeModal();
    showToast(copy.success);
  } catch {
    elements.formStatus.textContent = copy.failure;
  } finally {
    elements.formSubmit.disabled = false;
    elements.formSubmit.textContent = copy.submitForm;
  }
});

applyCopy();
renderStories();
loadPublishedStories();
