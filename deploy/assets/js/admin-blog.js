import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
  login,
  // Vendored from the @netlify/identity dependency rather than fetched from a
  // CDN: the sign-in form below submits a password, so the origin serving the
  // auth code has to be the same origin the editor already trusts.
} from "/assets/js/vendor/netlify-identity.js";

// Decap CMS renders itself into a #nc-root element it appends to the body, so
// it needs the page to itself. This page therefore does nothing except sign the
// editor in and hand over.
//
// The sign-in card stays on screen until Decap has actually painted something.
// Hiding it first is what used to turn a slow or blocked CDN into a permanently
// blank white page: no editor, no message, nothing to click.

const CMS_SOURCE = "https://unpkg.com/decap-cms@^3.8.3/dist/decap-cms.js";
const CMS_TIMEOUT_MS = 20000;

const gate = document.querySelector("#blog-gate");
const form = document.querySelector("#blog-login-form");
const formError = document.querySelector("#blog-login-error");
const loginButton = document.querySelector("#blog-login-button");
const status = document.querySelector("#blog-status");
const statusMessage = document.querySelector("#blog-status-message");
const retryButton = document.querySelector("#blog-retry");

function showStatus(message, { retry = false } = {}) {
  form.hidden = true;
  status.hidden = false;
  statusMessage.textContent = message;
  retryButton.hidden = !retry;
}

function showForm(message = "") {
  status.hidden = true;
  form.hidden = false;
  formError.textContent = message;
}

const cmsHasRendered = () => (document.querySelector("#nc-root")?.childElementCount ?? 0) > 0;

// Decap paints asynchronously after its bundle evaluates, so the handover is
// confirmed by watching for its root rather than by the script's load event.
function waitForCms() {
  return new Promise((resolve) => {
    const deadline = Date.now() + CMS_TIMEOUT_MS;
    const poll = window.setInterval(() => {
      if (cmsHasRendered()) {
        window.clearInterval(poll);
        resolve(true);
      } else if (Date.now() > deadline) {
        window.clearInterval(poll);
        resolve(false);
      }
    }, 150);
  });
}

async function loadCms() {
  showStatus("Opening the editor…");

  if (!document.querySelector("#decap-cms-script")) {
    const script = document.createElement("script");
    script.id = "decap-cms-script";
    script.src = CMS_SOURCE;
    script.addEventListener("error", () => {
      script.remove();
      showStatus(
        "The editor could not be downloaded. Check the connection — an ad blocker or offline network can block unpkg.com — and try again.",
        { retry: true },
      );
    });
    document.body.append(script);
  }

  if (await waitForCms()) {
    gate.hidden = true;
    return;
  }

  if (document.querySelector("#decap-cms-script")) {
    showStatus("The editor is taking longer than expected to start.", { retry: true });
  }
}

retryButton.addEventListener("click", () => {
  document.querySelector("#decap-cms-script")?.remove();
  loadCms();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";
  try {
    await login(form.email.value, form.password.value);
    await loadCms();
  } catch (error) {
    if (error instanceof MissingIdentityError) showForm("Netlify Identity is not enabled for this site.");
    else if (error instanceof AuthError && error.status === 401) showForm("Invalid email or password.");
    else showForm(error instanceof Error ? error.message : "Sign-in failed.");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign in securely";
  }
});

try {
  await handleAuthCallback();
  if (await getUser()) await loadCms();
  else showForm();
} catch (error) {
  showForm(error instanceof Error ? error.message : "Unable to complete authentication.");
}
