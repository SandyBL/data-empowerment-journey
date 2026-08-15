import { content } from "./confession-wall-content.js";

const locale = document.body.dataset.locale || "en";
const copy = content[locale] || content.en;

// The build writes the seeded stories into the page, so the first paint needs no
// JavaScript. This copy of them is what search and filtering re-render from, and
// what published submissions get prepended to once the API answers.
let stories = [...copy.defaultStories];
let activeCategory = copy.all;
let toastTimer;

const elements = {
  count: document.querySelector("#wall-count"),
  search: document.querySelector("#wall-search-input"),
  filters: document.querySelector("#wall-filters"),
  grid: document.querySelector("#wall-grid"),
  modal: document.querySelector("#submission-modal"),
  form: document.querySelector("#confession-form"),
  formStatus: document.querySelector("#confession-form-status"),
  formSubmit: document.querySelector("#confession-form-submit"),
  toast: document.querySelector("#wall-toast"),
};

/**
 * Attaches behaviour to the filter buttons the build already rendered.
 *
 * The buttons are real HTML now rather than something this script creates, so
 * the category list is crawlable and the page does not reflow when the script
 * arrives; all that is left to do here is make them clickable.
 */
function wireFilters() {
  const buttons = elements.filters.querySelectorAll(".wall-filter");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      buttons.forEach((filter) => filter.classList.remove("is-active"));
      button.classList.add("is-active");
      renderStories();
    });
  });
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
    // The seeded stories the build rendered are already on screen; leave them.
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

wireFilters();
loadPublishedStories();
