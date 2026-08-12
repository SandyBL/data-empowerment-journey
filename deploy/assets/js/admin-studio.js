import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
  login,
  logout,
} from "https://esm.sh/@netlify/identity@1.2.0";

// The studio hosts two independent tools with two independent authorities.
// Blog editing is authorized by Git Gateway when Decap commits, so signing in is
// the only gate it needs here — requiring a moderation role for it locked the
// blog behind a role it never used. Confession moderation is authorized by the
// /api/admin/confessions function; this list only decides which view to render
// and must stay in sync with netlify/functions/admin-confessions.mts.
const confessionRoles = ["confession-admin", "admin", "owner"];

const canModerate = (user) =>
  (user.roles ?? []).some((role) => confessionRoles.includes(String(role).toLowerCase()));

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

function loadCms() {
  loginView.hidden = true;
  shell.hidden = true;
  if (document.querySelector("#decap-cms-script")) return;
  const script = document.createElement("script");
  script.id = "decap-cms-script";
  script.src = "https://unpkg.com/decap-cms@^3.8.3/dist/decap-cms.js";
  document.body.append(script);
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

// Missing moderation rights are reported inside the queue rather than as a
// full-page wall, so the account keeps the access it does have: the blog.
function createModerationNotice(user) {
  const notice = createState("fa-user-shield", "");
  notice.classList.add("studio-state--notice");
  notice.querySelector("span").textContent =
    `${user.email || "This account"} is signed in and can edit the blog, but reviewing Confession Wall submissions also needs the "confession-admin" role.`;

  const help = document.createElement("p");
  help.className = "studio-state__help";
  help.textContent =
    "Add it once in Netlify: Project configuration → Identity → Users → this account → Edit roles.";

  const openBlog = document.createElement("button");
  openBlog.type = "button";
  openBlog.className = "studio-state__action";
  openBlog.textContent = "Open Blog Content Studio";
  openBlog.addEventListener("click", openBlogStudio);

  notice.append(help, openBlog);
  return notice;
}

function createSubmissionCard(submission) {
  const article = document.createElement("article");
  article.className = "studio-submission";

  const storyPanel = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "studio-submission__meta";
  [
    [submission.locale?.toUpperCase() || "—", "studio-pill studio-pill--locale"],
    [submission.category || "Uncategorized", "studio-pill"],
    [new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.createdAt)), "studio-pill"],
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id, action, expertComment: textarea.value.trim() }),
      });
      const payload = await response.json();
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

async function loadQueue(user) {
  queue.replaceChildren(createState("fa-spinner fa-spin", "Loading pending confessions…"));
  try {
    const response = await fetch("/api/admin/confessions");
    const payload = await response.json();
    if (response.status === 401 || response.status === 403) {
      pendingCount.textContent = "0";
      queue.replaceChildren(createModerationNotice(user));
      return;
    }
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
  if (new URLSearchParams(window.location.search).get("studio") === "blog") {
    loadCms();
    return;
  }
  if (!canModerate(user)) {
    pendingCount.textContent = "0";
    queue.replaceChildren(createModerationNotice(user));
    return;
  }
  await loadQueue(user);
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
    if (error instanceof MissingIdentityError) loginError.textContent = "Netlify Identity is not enabled for this site.";
    else if (error instanceof AuthError && error.status === 401) loginError.textContent = "Invalid email or password.";
    else loginError.textContent = error instanceof Error ? error.message : "Sign-in failed.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign in securely";
  }
});

async function signOut() {
  await logout();
  window.location.assign("/admin/");
}

function openBlogStudio() {
  window.history.replaceState({}, "", "/admin/?studio=blog");
  loadCms();
}

document.querySelectorAll("[data-sign-out]").forEach((button) => button.addEventListener("click", signOut));
document.querySelector("#open-blog-studio").addEventListener("click", (event) => {
  event.preventDefault();
  openBlogStudio();
});

try {
  await handleAuthCallback();
  const user = await getUser();
  if (user) await enterStudio(user);
  else showLogin();
} catch (error) {
  showLogin();
  loginError.textContent = error instanceof Error ? error.message : "Unable to complete authentication.";
}
