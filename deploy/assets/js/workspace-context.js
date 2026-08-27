/**
 * Private space context for the simulator pages.
 *
 * A company that licenses a private space gets the same nine simulator pages
 * everybody else gets. What changes is this file: it asks the server which space
 * this browser is seated in, and if the answer is a space, the page starts
 * behaving like the company's own — their name and logo in a strip under the
 * header, their accent colour on it, the words "global leaderboard" replaced by
 * their own name, and a way back to their space hub.
 *
 * Deliberately not a per-client fork of the pages. Nine pages times three
 * languages times every client would be an unmaintainable number of files, and
 * the moment a simulator changed, only the newest copy would get the fix. The
 * page stays one page; the space is a runtime fact about the visitor.
 *
 * The browser never decides which space it is in. That is settled by an
 * HttpOnly cookie this script cannot read, resolved server-side on every
 * request, so a participant cannot type their way into another company's space
 * and a lapsed licence stops working the moment it lapses rather than whenever
 * a cookie happens to expire.
 *
 * Nothing here throws and nothing here blocks. A simulator whose space lookup
 * fails is a simulator with a public leaderboard, which is exactly what it was
 * before this file existed — a failed request must never cost a participant the
 * exercise they are in the middle of.
 *
 * Deliberately a classic script rather than a module, matching
 * simulator-leaderboard.js: the callers are inline <script> blocks.
 */
(function () {
  "use strict";

  var SESSION_ENDPOINT = "/api/workspace/session";
  var STYLESHEET = "/assets/css/workspace.css";

  /**
   * Wording for the strip, in the three languages the simulators exist in.
   *
   * Held here rather than passed in from each page because it is the same six
   * phrases on all nine of them, and a per-page copy is a per-page chance for
   * one of them to be left in English.
   */
  var COPY = {
    en: {
      label: "Private space",
      until: "Access until",
      hub: "Space home",
      report: "Facilitator report",
      leave: "Leave space",
      leaving: "Leaving…",
    },
    es: {
      label: "Espacio privado",
      until: "Acceso hasta",
      hub: "Inicio del espacio",
      report: "Informe del facilitador",
      leave: "Salir del espacio",
      leaving: "Saliendo…",
    },
    pt: {
      label: "Espaço privado",
      until: "Acesso até",
      hub: "Início do espaço",
      report: "Relatório do facilitador",
      leave: "Sair do espaço",
      leaving: "Saindo…",
    },
  };

  var state = { joined: false, role: null, space: null, label: null, expiresAt: null };
  var applied = false;

  function locale() {
    var fromPath = /\/(en|es|pt)\//.exec(window.location.pathname);
    if (fromPath) return fromPath[1];
    var lang = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
    return COPY[lang] ? lang : "en";
  }

  function copy() {
    return COPY[locale()] || COPY.en;
  }

  /** A slug as the server would normalise it, so a bad ?space= never reaches the API. */
  function normalizeSlug(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "";
    try {
      return date.toLocaleDateString(locale(), { year: "numeric", month: "long", day: "numeric" });
    } catch (error) {
      return date.toISOString().split("T")[0];
    }
  }

  /**
   * Loads the space stylesheet, once, and only for a browser that is in a space.
   *
   * A public visitor is the overwhelming majority of traffic and gets no extra
   * request out of this feature at all — which is the reason the strip is styled
   * from its own file rather than added to a stylesheet every page already
   * links.
   */
  function ensureStylesheet() {
    if (document.querySelector('link[data-workspace-stylesheet="true"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = STYLESHEET;
    link.setAttribute("data-workspace-stylesheet", "true");
    document.head.appendChild(link);
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    // textContent throughout: every string below is either our own wording or a
    // company name typed into the admin console, and neither has any business
    // being parsed as markup.
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /**
   * Replaces "global" with the client's name wherever the page calls its
   * leaderboard a global one.
   *
   * The nine pages say it eleven different ways across three languages -- "Global
   * Leaderboard", "RANKING GLOBAL", "Tabla de Clasificación Global" -- so rather
   * than matching each phrase, this replaces the one word they have in common,
   * and only inside a text node that is talking about a leaderboard. Text nodes
   * only, so nothing can turn a company name into markup, and no attribute or
   * script content is touched.
   *
   * A page that phrases it some other way simply keeps its own wording. That is
   * an acceptable miss: the strip above already says whose space this is.
   */
  function relabelBoard(company) {
    var mentionsBoard = /leaderboard|ranking|clasificaci|classifica/i;
    var globalWord = /\bglobal\b/gi;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var pending = [];
    var node;

    while ((node = walker.nextNode())) {
      var parent = node.parentNode;
      if (!parent) continue;
      var tag = parent.nodeName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA") continue;
      var text = node.nodeValue;
      if (!text || text.length > 400) continue;
      if (!mentionsBoard.test(text) || !globalWord.test(text)) continue;
      pending.push(node);
    }

    for (var index = 0; index < pending.length; index += 1) {
      pending[index].nodeValue = pending[index].nodeValue.replace(globalWord, company);
    }
  }

  /** Ends this seat and returns to the space gate. */
  function leave(button) {
    var words = copy();
    button.disabled = true;
    button.textContent = words.leaving;

    var slug = state.space && state.space.slug ? state.space.slug : "";

    fetch(SESSION_ENDPOINT, { method: "DELETE", headers: { Accept: "application/json" } })
      .catch(function (error) {
        console.warn("Leaving the space failed", error);
      })
      .then(function () {
        // Straight to the gate rather than a reload: a reload would land the
        // participant on a simulator page that has just become public, with no
        // explanation of where their space went.
        window.location.href = slug ? "/w/" + encodeURIComponent(slug) + "/" : "/";
      });
  }

  /** The strip under the site header. */
  function renderBanner() {
    var header = document.querySelector(".simulator-site-header");
    var host = header && header.parentNode ? header.parentNode : document.body;
    if (document.querySelector(".workspace-banner")) return;

    var words = copy();
    var space = state.space;
    var banner = element("div", "workspace-banner");
    banner.setAttribute("role", "status");
    var inner = element("div", "workspace-banner-inner");

    if (space.logoUrl) {
      var logo = document.createElement("img");
      logo.className = "workspace-banner-logo";
      logo.src = space.logoUrl;
      logo.alt = space.company || "";
      logo.width = 28;
      logo.height = 28;
      logo.loading = "lazy";
      logo.decoding = "async";
      // The logo is fetched from the client's own site, which is the one third
      // party in this request their own people are already talking to. No
      // referrer, so their marketing site's logs do not fill up with the URLs of
      // the exercises their staff are playing.
      logo.referrerPolicy = "no-referrer";
      inner.appendChild(logo);
    }

    var copyBlock = element("div", "workspace-banner-copy");
    copyBlock.appendChild(element("span", "workspace-banner-label", words.label));
    copyBlock.appendChild(element("span", "workspace-banner-name", space.displayName || space.company));
    inner.appendChild(copyBlock);

    var meta = element("div", "workspace-banner-meta");
    var until = formatDate(space.expiresAt);
    if (until) meta.appendChild(element("span", "workspace-banner-until", words.until + " " + until));

    var hub = element("a", "workspace-banner-link", words.hub);
    hub.href = "/w/" + encodeURIComponent(space.slug) + "/";
    meta.appendChild(hub);

    if (state.role === "sponsor") {
      var report = element("a", "workspace-banner-link", words.report);
      report.href = "/w/" + encodeURIComponent(space.slug) + "/#report";
      meta.appendChild(report);
    }

    var leaveButton = element("button", "workspace-banner-leave", words.leave);
    leaveButton.type = "button";
    leaveButton.addEventListener("click", function () {
      leave(leaveButton);
    });
    meta.appendChild(leaveButton);

    inner.appendChild(meta);
    banner.appendChild(inner);

    if (header && header.nextSibling) host.insertBefore(banner, header.nextSibling);
    else if (header) host.appendChild(banner);
    else document.body.insertBefore(banner, document.body.firstChild);
  }

  function apply() {
    if (applied || !state.joined || !state.space) return;
    applied = true;

    ensureStylesheet();
    document.documentElement.setAttribute("data-workspace", state.space.slug);
    if (state.space.accentColor) {
      document.documentElement.style.setProperty("--workspace-accent", state.space.accentColor);
    }

    var run = function () {
      renderBanner();
      relabelBoard(state.space.company || state.space.displayName || "");
      document.dispatchEvent(new CustomEvent("workspace:ready", { detail: { space: state.space, role: state.role } }));
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }

  /**
   * A participant who followed a link carrying ?space= but has no seat is sent
   * to that space's gate, with the page they were heading for remembered.
   *
   * This is the shape of the link a facilitator pastes into a chat window, so
   * arriving at the code screen and then landing on the right simulator is the
   * whole journey. Guarded so it can only ever happen once per navigation: the
   * gate itself never carries ?space=, so there is no path back into a loop.
   */
  function redirectToGate(slug) {
    var next = window.location.pathname;
    window.location.replace("/w/" + encodeURIComponent(slug) + "/?next=" + encodeURIComponent(next));
  }

  function bootstrap() {
    var params = new URLSearchParams(window.location.search);
    var requested = normalizeSlug(params.get("space"));
    var url = SESSION_ENDPOINT + (requested ? "?slug=" + encodeURIComponent(requested) : "");

    return fetch(url, { headers: { Accept: "application/json" }, credentials: "same-origin" })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data && data.joined && data.space) {
          state = {
            joined: true,
            role: data.role || "participant",
            space: data.space,
            label: data.label || null,
            expiresAt: data.expiresAt || null,
          };
          apply();
          return state;
        }

        // Named a space, holds no seat in it: the gate is the next step, and it
        // is where the wording explaining any of this lives.
        if (requested && data && data.reason !== "other-space") {
          redirectToGate(requested);
        }

        return state;
      })
      .catch(function (error) {
        // A public page with a failed lookup is just a public page.
        console.warn("Workspace context unavailable", error);
        return state;
      });
  }

  var ready = bootstrap();

  window.SimulatorWorkspace = {
    /** Resolves once the space is known, to the state object. Never rejects. */
    ready: ready,
    state: function () {
      return state;
    },
    /** The slug to send with a leaderboard read or write, or null when public. */
    slug: function () {
      return state.joined && state.space ? state.space.slug : null;
    },
    isJoined: function () {
      return state.joined;
    },
    isSponsor: function () {
      return state.role === "sponsor";
    },
    space: function () {
      return state.space;
    },
  };
})();
