import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
  login,
  logout,
  // Vendored from the @netlify/identity dependency rather than fetched from a
  // CDN: the sign-in form below submits a password, so the origin serving the
  // auth code has to be the same origin the operator already trusts.
} from "/assets/js/vendor/netlify-identity.js";

// Confession moderation is gated by sign-in alone, exactly like the Blog
// Content Studio: an authorized Netlify Identity account is the whole
// authorization model for this site. No extra role is required here or in
// netlify/functions/admin-confessions.mts — keep the two in step.
//
// The Blog Content Studio lives on its own page (/admin/blog/). It used to
// share this one, which meant handing the document over to Decap CMS and
// hiding every element this page owns. Any hiccup in that handover — a blocked
// CDN, a stale ?studio=blog URL — left a white page with no message and no way
// back. This page now never hides all of its own views.

const loginView = document.querySelector("#studio-login");
const loginForm = document.querySelector("#studio-login-form");
const loginError = document.querySelector("#studio-login-error");
const loginButton = document.querySelector("#studio-login-button");
const shell = document.querySelector("#studio-shell");
const queue = document.querySelector("#studio-queue");
const pendingCount = document.querySelector("#studio-pending-count");

function showLogin() {
  loginView.hidden = false;
  shell.hidden = true;
}

function showShell(user) {
  loginView.hidden = true;
  shell.hidden = false;
  document.querySelector("#studio-user-email").textContent = user.email || "Authenticated administrator";
}

function createState(icon, message) {
  const state = document.createElement("div");
  state.className = "studio-state";
  state.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
  const text = document.createElement("span");
  text.textContent = message;
  state.append(text);
  return state;
}

// A rejected request means the session is gone or no longer valid, not that the
// account lacks a privilege — so the only useful next step is signing in again.
function createSessionNotice() {
  const notice = createState("fa-user-shield", "Your session has expired or is no longer valid. Sign in again to review submissions.");
  notice.classList.add("studio-state--notice");

  const signIn = document.createElement("button");
  signIn.type = "button";
  signIn.className = "studio-state__action";
  signIn.textContent = "Sign in again";
  signIn.addEventListener("click", signOut);

  notice.append(signIn);
  return notice;
}

function createSubmissionCard(submission) {
  const article = document.createElement("article");
  article.className = "studio-submission";

  const storyPanel = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "studio-submission__meta";
  const createdAt = new Date(submission.createdAt);
  [
    [submission.locale?.toUpperCase() || "—", "studio-pill studio-pill--locale"],
    [submission.category || "Uncategorized", "studio-pill"],
    [Number.isNaN(createdAt.valueOf())
      ? "Date unavailable"
      : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(createdAt), "studio-pill"],
  ].forEach(([text, className]) => {
    const pill = document.createElement("span");
    pill.className = className;
    pill.textContent = text;
    meta.append(pill);
  });

  const title = document.createElement("h2");
  title.textContent = submission.title;
  const role = document.createElement("p");
  role.className = "studio-submission__role";
  role.textContent = submission.role;
  const story = document.createElement("p");
  story.className = "studio-submission__story";
  story.textContent = submission.story;
  storyPanel.append(meta, title, role, story);

  const review = document.createElement("div");
  review.className = "studio-review";
  const label = document.createElement("label");
  label.htmlFor = `expert-comment-${submission.id}`;
  label.textContent = "Sandy's governance guidance (required to publish)";
  const textarea = document.createElement("textarea");
  textarea.id = `expert-comment-${submission.id}`;
  textarea.maxLength = 3000;
  textarea.placeholder = "Explain the governance practice that would prevent or reduce this problem…";
  const status = document.createElement("p");
  status.className = "studio-review__status";
  status.setAttribute("role", "alert");
  const actions = document.createElement("div");
  actions.className = "studio-review__actions";
  const reject = document.createElement("button");
  reject.type = "button";
  reject.className = "studio-reject";
  reject.textContent = "Reject privately";
  const publish = document.createElement("button");
  publish.type = "button";
  publish.className = "studio-publish";
  publish.textContent = "Approve and publish";
  actions.append(reject, publish);
  review.append(label, textarea, status, actions);
  article.append(storyPanel, review);

  async function moderate(action) {
    status.textContent = "";
    if (action === "publish" && textarea.value.trim().length < 20) {
      status.textContent = "Add a practical expert comment before publishing.";
      textarea.focus();
      return;
    }

    reject.disabled = true;
    publish.disabled = true;

    try {
      const response = await fetch("/api/admin/confessions", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id, action, expertComment: textarea.value.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Moderation failed");
      article.remove();
      const remaining = queue.querySelectorAll(".studio-submission").length;
      pendingCount.textContent = String(remaining);
      if (!remaining) queue.append(createState("fa-circle-check", "The moderation queue is clear."));
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Moderation failed.";
      reject.disabled = false;
      publish.disabled = false;
    }
  }

  reject.addEventListener("click", () => moderate("reject"));
  publish.addEventListener("click", () => moderate("publish"));
  return article;
}

async function loadQueue() {
  queue.replaceChildren(createState("fa-spinner fa-spin", "Loading pending confessions…"));
  try {
    const response = await fetch("/api/admin/confessions", { credentials: "same-origin" });
    if (response.status === 401 || response.status === 403) {
      pendingCount.textContent = "0";
      queue.replaceChildren(createSessionNotice());
      return;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Unable to load submissions");
    const submissions = Array.isArray(payload.submissions) ? payload.submissions : [];
    pendingCount.textContent = String(submissions.length);
    queue.replaceChildren();
    if (!submissions.length) {
      queue.append(createState("fa-circle-check", "The moderation queue is clear."));
      return;
    }
    queue.append(...submissions.map(createSubmissionCard));
  } catch (error) {
    queue.replaceChildren(createState("fa-triangle-exclamation", error instanceof Error ? error.message : "Unable to load submissions."));
  }
}

async function enterStudio(user) {
  showShell(user);
  // Deliberately not awaited together: the moderation queue is the reason
  // anyone opens this page, and a slow percentile query should not delay it.
  await loadQueue();
  loadVitals();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";
  try {
    const user = await login(loginForm.email.value, loginForm.password.value);
    await enterStudio(user);
  } catch (error) {
    showLogin();
    if (error instanceof MissingIdentityError) loginError.textContent = "Netlify Identity is not enabled for this site.";
    else if (error instanceof AuthError && error.status === 401) loginError.textContent = "Invalid email or password.";
    else loginError.textContent = error instanceof Error ? error.message : "Sign-in failed.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign in securely";
  }
});

// Core Web Vitals collected by assets/js/web-vitals.js. Milliseconds for every
// metric except CLS, which is a unitless ratio.
const VITALS_UNITS = { LCP: "ms", INP: "ms", FCP: "ms", TTFB: "ms", CLS: "" };
const VITALS_ORDER = ["LCP", "INP", "CLS", "FCP", "TTFB"];

function formatVital(metric, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (metric === "CLS") return number.toFixed(3);
  return number >= 1000 ? `${(number / 1000).toFixed(2)} s` : `${Math.round(number)} ms`;
}

// The same thresholds the browser applied when it recorded the sample, repeated
// here because the panel shows a percentile rather than any single measurement.
const VITALS_THRESHOLDS = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25], FCP: [1800, 3000], TTFB: [800, 1800] };

function rateVital(metric, value) {
  const thresholds = VITALS_THRESHOLDS[metric];
  if (!thresholds) return "good";
  return value <= thresholds[0] ? "good" : value <= thresholds[1] ? "needs-improvement" : "poor";
}

function createVitalCard(metric, row) {
  const p75 = Number(row.p75);
  const card = document.createElement("div");
  card.className = `studio-vitals__card studio-vitals__card--${rateVital(metric, p75)}`;

  const name = document.createElement("span");
  name.className = "studio-vitals__metric";
  name.textContent = metric;

  const value = document.createElement("span");
  value.className = "studio-vitals__value";
  value.textContent = formatVital(metric, p75);

  const samples = document.createElement("span");
  samples.className = "studio-vitals__samples";
  const good = Number(row.good_percent);
  samples.textContent = Number.isFinite(good)
    ? `${row.samples} samples · ${good}% good`
    : `${row.samples} samples`;

  card.append(name, value, samples);
  return card;
}

async function loadVitals() {
  const body = document.querySelector("#studio-vitals-body");
  if (!body) return;

  const message = (text) => {
    const state = document.createElement("p");
    state.className = "studio-vitals__empty";
    state.textContent = text;
    body.replaceChildren(state);
  };

  message("Loading field data…");

  try {
    const response = await fetch("/api/admin/vitals", { credentials: "same-origin" });
    if (!response.ok) throw new Error("unavailable");
    const payload = await response.json();
    const rows = new Map((payload.metrics || []).map((row) => [row.metric, row]));

    if (!rows.size) {
      message("No field data yet. Measurements appear here once visitors have loaded pages since this was switched on.");
      return;
    }

    const grid = document.createElement("div");
    grid.className = "studio-vitals__grid";
    for (const metric of VITALS_ORDER) {
      if (rows.has(metric)) grid.append(createVitalCard(metric, rows.get(metric)));
    }
    body.replaceChildren(grid);

    const slowest = (payload.slowestPages || []).slice(0, 5);
    if (!slowest.length) return;

    const section = document.createElement("div");
    section.className = "studio-vitals__slowest";
    const heading = document.createElement("h3");
    heading.textContent = "Slowest pages to paint";
    const list = document.createElement("ol");
    for (const page of slowest) {
      const item = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = page.path;
      item.append(code, document.createTextNode(` — ${formatVital("LCP", page.p75)}`));
      list.append(item);
    }
    section.append(heading, list);
    body.append(section);
  } catch {
    // A panel that cannot load is not a reason to interrupt moderation, so this
    // says so quietly and leaves the queue above it alone.
    message("Field data is unavailable right now.");
  }
}

async function signOut() {
  try {
    await logout();
  } finally {
    window.location.assign("/admin/");
  }
}

document.querySelectorAll("[data-sign-out]").forEach((button) => button.addEventListener("click", signOut));

// The blog studio used to open in place through this query string. Anyone who
// bookmarked that URL is sent to the page that now owns it.
if (new URLSearchParams(window.location.search).get("studio") === "blog") {
  window.location.replace("/admin/blog/");
} else {
  try {
    await handleAuthCallback();
    const user = await getUser();
    if (user) await enterStudio(user);
    else showLogin();
  } catch (error) {
    showLogin();
    loginError.textContent = error instanceof Error ? error.message : "Unable to complete authentication.";
  }
}
