import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
  login,
  logout,
  // Vendored rather than fetched from a CDN, for the same reason as the other
  // two consoles: the form below submits a password, so the origin serving the
  // auth code has to be the origin the operator already trusts.
} from "/assets/js/vendor/netlify-identity.js";

// The private-spaces console. Talks to /api/admin/workspaces for the spaces
// themselves and /api/admin/workspace-scores for individual leaderboard rows.
//
// Both endpoints re-check Netlify Identity on every request, so nothing here is
// a security boundary — this file decides what is easy to do, not what is
// allowed. Two consequences worth keeping:
//
//   * Codes are rendered exactly once, from the response that generated them,
//     and never re-fetched, because the server stores only their hash. The panel
//     that shows them is deliberately noisy about that.
//   * Anything destructive asks for a typed confirmation rather than a click:
//     deleting a space takes its leaderboard with it, and there is no undo
//     anywhere in this feature.
//
// Keep in sync with netlify/functions/admin-workspaces.mts and
// netlify/functions/admin-workspace-scores.mts.

const SPACES_ENDPOINT = "/api/admin/workspaces";
const ROWS_ENDPOINT = "/api/admin/workspace-scores";

const SIMULATOR_NAMES = {
  "data-governance-day-to-day": "Data Governance Day-to-Day",
  "data-literacy": "Data Literacy",
  "data-ownership-conflict": "Data Ownership Conflict",
};

const loginView = document.querySelector("#spaces-login");
const loginForm = document.querySelector("#spaces-login-form");
const loginError = document.querySelector("#spaces-login-error");
const loginButton = document.querySelector("#spaces-login-button");
const shell = document.querySelector("#spaces-shell");
const list = document.querySelector("#spaces-list");
const spacesCount = document.querySelector("#spaces-count");
const createForm = document.querySelector("#spaces-create-form");
const createError = document.querySelector("#spaces-create-error");
const createButton = document.querySelector("#spaces-create-button");
const codesPanel = document.querySelector("#spaces-codes");
const codesBody = document.querySelector("#spaces-codes-body");
const boardSelect = document.querySelector("#rows-board");
const simulatorSelect = document.querySelector("#rows-simulator");
const rowsBody = document.querySelector("#spaces-rows");
const rowsError = document.querySelector("#rows-error");
const deleteRowsButton = document.querySelector("#rows-delete");

function showLogin() {
  loginView.hidden = false;
  shell.hidden = true;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function state(container, message) {
  const node = element("p", "studio-state", message);
  container.replaceChildren(node);
}

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const stampFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value, formatter = dateFormat) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

/** yyyy-mm-dd for a date input, from an ISO timestamp. */
function dateInputValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/**
 * One authenticated call, with the 401 case separated out.
 *
 * A rejected request means the Identity session is gone rather than that the
 * account lacks a privilege, so it ends in a sign-out rather than an error
 * message about permissions that would send the operator looking for a role.
 */
async function api(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    await signOut();
    throw new Error("Your session expired. Sign in again.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "That change did not go through.");
  return payload;
}

/* -------------------------------------------------------------------------
 * Codes
 * ---------------------------------------------------------------------- */

/**
 * Shows a freshly generated code, once.
 *
 * Rendered as selectable text with a copy button rather than only a button: a
 * facilitator reads these aloud to a room, and a value that can only be copied
 * to a clipboard cannot be read off a screen while dictating.
 */
function showCodes(title, codes) {
  const entries = Object.entries(codes).filter(([, value]) => Boolean(value));
  if (!entries.length) return;

  const wrap = element("div");
  wrap.append(element("h3", null, title));

  for (const [kind, value] of entries) {
    const row = element("div", "spaces-codes__row");
    row.append(element("span", null, kind === "sponsorCode" ? "Sponsor code" : "Participant code"));
    row.append(element("code", "spaces-code", value));

    const copy = element("button", "spaces-button spaces-button--ghost", "Copy");
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);
        copy.textContent = "Copied";
      } catch {
        // Clipboard access can be refused outright. The code is on screen
        // either way, which is the point of showing it as text.
        copy.textContent = "Select it manually";
      }
    });

    row.append(copy);
    wrap.append(row);
  }

  codesBody.replaceChildren(wrap);
  codesPanel.hidden = false;
  codesPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelector("#spaces-codes-dismiss").addEventListener("click", () => {
  codesBody.replaceChildren();
  codesPanel.hidden = true;
});

/* -------------------------------------------------------------------------
 * Spaces
 * ---------------------------------------------------------------------- */

function statusPill(space) {
  const reason = space.closedReason;
  const label = reason ? { suspended: "Suspended", expired: "Expired", "not-started": "Not started yet" }[reason] : "Active";
  const variant = reason === "suspended" ? "suspended" : reason ? "expired" : "active";
  return element("span", `spaces-status spaces-status--${variant}`, label);
}

/** The branding-and-licence editor, folded into each card. */
function createEditor(space, reload) {
  const form = element("form", "spaces-form");
  form.hidden = true;

  const grid = element("div", "spaces-form__grid");
  const fields = {};

  const addField = (name, label, type, value, hint) => {
    const wrap = element("div", "studio-field");
    const id = `edit-${name}-${space.id}`;
    const labelNode = element("label", null, label);
    labelNode.htmlFor = id;
    const input = document.createElement(type === "select" ? "select" : "input");
    input.id = id;
    if (type === "select") {
      for (const [code, text] of [["en", "English"], ["es", "Español"], ["pt", "Português"]]) {
        const option = element("option", null, text);
        option.value = code;
        if (code === value) option.selected = true;
        input.append(option);
      }
    } else {
      input.type = type;
      input.value = value ?? "";
      if (type === "text" || type === "url") input.maxLength = type === "url" ? 300 : 120;
    }
    wrap.append(labelNode, input);
    if (hint) wrap.append(element("small", null, hint));
    grid.append(wrap);
    fields[name] = input;
  };

  addField("company", "Company", "text", space.company);
  addField("displayName", "Header title", "text", space.displayName);
  addField("locale", "Opening language", "select", space.locale);
  addField("logoUrl", "Client logo URL", "url", space.logoUrl || "", "Empty removes the logo.");
  addField("accentColor", "Accent colour", "color", space.accentColor || "#65b7c7");
  addField("startsAt", "Access starts", "date", dateInputValue(space.startsAt));
  addField("expiresAt", "Access ends", "date", dateInputValue(space.expiresAt));

  const error = element("p", "studio-error", "");
  error.setAttribute("role", "alert");
  const save = element("button", "spaces-button", "Save changes");
  save.type = "submit";
  const actions = element("div", "spaces-actions");
  actions.append(save, error);

  form.append(grid, actions);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    save.disabled = true;
    try {
      await api(SPACES_ENDPOINT, {
        method: "PATCH",
        body: JSON.stringify({
          id: space.id,
          action: "update",
          company: fields.company.value,
          displayName: fields.displayName.value,
          locale: fields.locale.value,
          logoUrl: fields.logoUrl.value,
          accentColor: fields.accentColor.value,
          startsAt: fields.startsAt.value,
          expiresAt: fields.expiresAt.value,
        }),
      });
      await reload();
    } catch (failure) {
      error.textContent = failure.message;
    } finally {
      save.disabled = false;
    }
  });

  return form;
}

function createSpaceCard(space, reload) {
  const card = element("article", "spaces-card");

  const head = element("div", "spaces-card__head");
  const title = element("div", "spaces-card__title");
  title.append(element("h3", null, space.displayName));
  title.append(element("p", null, space.company));
  head.append(title, statusPill(space));
  card.append(head);

  const meta = element("div", "spaces-card__meta");
  const address = element("a", null, `/w/${space.slug}/`);
  address.href = `/w/${space.slug}/`;
  address.target = "_blank";
  address.rel = "noopener";
  meta.append(address);
  meta.append(element("span", null, `${formatDate(space.startsAt)} → ${formatDate(space.expiresAt)}`));
  meta.append(element("span", null, space.locale.toUpperCase()));
  meta.append(element("span", null, space.hasSponsorCode ? "Sponsor code issued" : "No sponsor code"));
  card.append(meta);

  const stats = element("div", "spaces-card__stats");
  for (const [value, label] of [
    [space.runs, "runs published"],
    [space.seats, "seats opened"],
  ]) {
    const stat = element("div");
    stat.append(element("strong", null, String(value)));
    stat.append(element("span", null, label));
    stats.append(stat);
  }
  card.append(stats);

  const editor = createEditor(space, reload);
  const actions = element("div", "spaces-card__actions");
  const error = element("p", "studio-error", "");
  error.setAttribute("role", "alert");

  /** Wires one action button, so no handler has to repeat the disable dance. */
  const action = (label, className, handler) => {
    const button = element("button", className || "spaces-button spaces-button--ghost", label);
    button.type = "button";
    button.addEventListener("click", async () => {
      error.textContent = "";
      button.disabled = true;
      try {
        await handler();
      } catch (failure) {
        error.textContent = failure.message;
      } finally {
        button.disabled = false;
      }
    });
    actions.append(button);
    return button;
  };

  const patch = (body) => api(SPACES_ENDPOINT, { method: "PATCH", body: JSON.stringify({ id: space.id, ...body }) });

  action("Edit", null, async () => {
    editor.hidden = !editor.hidden;
  });

  action("New participant code", null, async () => {
    if (!window.confirm(`Replace the participant code for ${space.displayName}? Everyone currently in the space is signed out.`)) return;
    const payload = await patch({ action: "regenerate-code" });
    showCodes(`New participant code for ${space.displayName}`, payload.codes);
    await reload();
  });

  action(space.hasSponsorCode ? "New sponsor code" : "Issue sponsor code", null, async () => {
    const payload = await patch({ action: "regenerate-sponsor-code" });
    showCodes(`Sponsor code for ${space.displayName}`, payload.codes);
    await reload();
  });

  if (space.hasSponsorCode) {
    action("Withdraw sponsor access", null, async () => {
      if (!window.confirm(`Withdraw the sponsor code for ${space.displayName}? The facilitator report closes.`)) return;
      await patch({ action: "revoke-sponsor-code" });
      await reload();
    });
  }

  action("Sign everyone out", null, async () => {
    if (!window.confirm(`Sign every participant out of ${space.displayName}? They can rejoin with the same code.`)) return;
    const payload = await patch({ action: "revoke-seats" });
    error.textContent = `${payload.revoked} seat${payload.revoked === 1 ? "" : "s"} ended.`;
  });

  if (space.status === "active") {
    action("Suspend access", "spaces-button spaces-danger", async () => {
      if (!window.confirm(`Suspend ${space.displayName}? Nobody can enter or play until it is restored.`)) return;
      await patch({ action: "suspend" });
      await reload();
    });
  } else {
    action("Restore access", null, async () => {
      await patch({ action: "activate" });
      await reload();
    });
  }

  action("Delete space", "spaces-button spaces-danger", async () => {
    // Typing the slug back, not a click. This deletes the leaderboard with the
    // space, which is right when a client asks for their data to go and
    // expensive in every other case.
    const typed = window.prompt(`Deleting ${space.displayName} also deletes its ${space.runs} leaderboard rows. Type the slug "${space.slug}" to confirm.`);
    if (typed === null) return;
    const payload = await api(SPACES_ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify({ id: space.id, confirm: typed }),
    });
    error.textContent = `Deleted ${payload.deleted.slug} and ${payload.deleted.runs} rows.`;
    await reload();
  });

  card.append(actions, error, editor);
  return card;
}

async function loadSpaces() {
  state(list, "Loading spaces…");
  try {
    const payload = await api(SPACES_ENDPOINT);
    spacesCount.textContent = String(payload.spaces.length);

    // The board filter is rebuilt from the same response, so a space created a
    // moment ago is immediately available to moderate.
    const previous = boardSelect.value;
    boardSelect.replaceChildren();
    const publicOption = element("option", null, `Public board (${payload.publicRuns} rows)`);
    publicOption.value = "public";
    boardSelect.append(publicOption);
    for (const space of payload.spaces) {
      const option = element("option", null, `${space.displayName} (${space.runs} rows)`);
      option.value = String(space.id);
      boardSelect.append(option);
    }
    boardSelect.value = [...boardSelect.options].some((option) => option.value === previous) ? previous : "public";

    if (!payload.spaces.length) {
      state(list, "No spaces yet. The form above opens the first one.");
      return;
    }

    list.replaceChildren(...payload.spaces.map((space) => createSpaceCard(space, loadSpaces)));
  } catch (error) {
    state(list, error.message);
  }
}

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  createError.textContent = "";
  createButton.disabled = true;
  createButton.textContent = "Creating…";

  try {
    const payload = await api(SPACES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        company: createForm.company.value,
        slug: createForm.slug.value,
        displayName: createForm.displayName.value,
        locale: createForm.locale.value,
        logoUrl: createForm.logoUrl.value,
        accentColor: createForm.accentColor.value,
        startsAt: createForm.startsAt.value,
        expiresAt: createForm.expiresAt.value,
        sponsorAccess: createForm.sponsorAccess.checked,
      }),
    });

    showCodes(`Codes for ${payload.space.displayName} — /w/${payload.space.slug}/`, payload.codes);
    createForm.reset();
    await loadSpaces();
  } catch (error) {
    createError.textContent = error.message;
  } finally {
    createButton.disabled = false;
    createButton.textContent = "Create the space";
  }
});

/* -------------------------------------------------------------------------
 * Leaderboard rows
 * ---------------------------------------------------------------------- */

function formatDuration(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value <= 0) return "—";
  const seconds = Math.round(value / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** The per-dimension figures, as a short readable line rather than raw JSON. */
function formatBreakdown(breakdown) {
  if (!breakdown || typeof breakdown !== "object") return "—";
  return (
    Object.entries(breakdown)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ") || "—"
  );
}

function updateDeleteButton() {
  const selected = rowsBody.querySelectorAll("input[type=checkbox]:checked").length;
  deleteRowsButton.disabled = selected === 0;
  deleteRowsButton.textContent = selected ? `Delete ${selected} selected row${selected === 1 ? "" : "s"}` : "Delete selected rows";
}

async function loadRows() {
  rowsError.textContent = "";
  state(rowsBody, "Loading rows…");

  const params = new URLSearchParams({ space: boardSelect.value, limit: "200" });
  if (simulatorSelect.value) params.set("simulator", simulatorSelect.value);

  try {
    const payload = await api(`${ROWS_ENDPOINT}?${params.toString()}`);

    if (!payload.rows.length) {
      state(rowsBody, "No rows on this board yet.");
      updateDeleteButton();
      return;
    }

    const table = element("table", "spaces-table");
    const head = element("thead");
    const headRow = element("tr");
    for (const label of ["", "Published", "Simulator", "Name", "Seat", "Score", "Time", "Dimensions"]) {
      headRow.append(element("th", null, label));
    }
    head.append(headRow);

    const body = element("tbody");
    for (const row of payload.rows) {
      const tr = element("tr");

      const tick = element("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = String(row.id);
      checkbox.setAttribute("aria-label", `Select ${row.name}'s row`);
      checkbox.addEventListener("change", updateDeleteButton);
      tick.append(checkbox);
      tr.append(tick);

      tr.append(element("td", null, formatDate(row.createdAt, stampFormat)));
      tr.append(element("td", null, SIMULATOR_NAMES[row.simulator] || row.simulator));
      tr.append(element("td", null, row.name));
      tr.append(element("td", null, row.seatLabel ? `${row.seatLabel}${row.seatRole === "sponsor" ? " (sponsor)" : ""}` : "—"));
      tr.append(element("td", null, String(row.score)));
      tr.append(element("td", null, formatDuration(row.durationMs)));
      tr.append(element("td", "spaces-table__breakdown", formatBreakdown(row.breakdown)));
      body.append(tr);
    }

    table.append(head, body);
    rowsBody.replaceChildren(table);
    updateDeleteButton();
  } catch (error) {
    state(rowsBody, error.message);
  }
}

deleteRowsButton.addEventListener("click", async () => {
  const ids = [...rowsBody.querySelectorAll("input[type=checkbox]:checked")].map((box) => Number(box.value));
  if (!ids.length) return;
  if (!window.confirm(`Delete ${ids.length} leaderboard row${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;

  rowsError.textContent = "";
  deleteRowsButton.disabled = true;
  try {
    const payload = await api(ROWS_ENDPOINT, { method: "DELETE", body: JSON.stringify({ ids }) });
    rowsError.textContent = `Deleted ${payload.deleted.length} row${payload.deleted.length === 1 ? "" : "s"}.`;
    await Promise.all([loadRows(), loadSpaces()]);
  } catch (error) {
    rowsError.textContent = error.message;
  } finally {
    updateDeleteButton();
  }
});

boardSelect.addEventListener("change", loadRows);
simulatorSelect.addEventListener("change", loadRows);
document.querySelector("#rows-refresh").addEventListener("click", loadRows);

/* -------------------------------------------------------------------------
 * Session
 * ---------------------------------------------------------------------- */

async function signOut() {
  try {
    await logout();
  } finally {
    window.location.assign("/admin/spaces/");
  }
}

document.querySelectorAll("[data-sign-out]").forEach((button) => button.addEventListener("click", signOut));

async function enterConsole(user) {
  loginView.hidden = true;
  shell.hidden = false;
  document.querySelector("#spaces-user-email").textContent = user.email || "Authenticated administrator";
  await loadSpaces();
  await loadRows();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";
  try {
    const user = await login(loginForm.email.value, loginForm.password.value);
    await enterConsole(user);
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

try {
  await handleAuthCallback();
  const user = await getUser();
  if (user) await enterConsole(user);
  else showLogin();
} catch (error) {
  showLogin();
  loginError.textContent = error instanceof Error ? error.message : "Unable to complete authentication.";
}
