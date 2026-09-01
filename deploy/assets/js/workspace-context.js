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
      language: "Language",
      seatedName: "This is the name you entered when you joined this space.",
    },
    es: {
      label: "Espacio privado",
      until: "Acceso hasta",
      hub: "Inicio del espacio",
      report: "Informe del facilitador",
      leave: "Salir del espacio",
      leaving: "Saliendo…",
      language: "Idioma",
      seatedName: "Este es el nombre que escribiste al entrar en este espacio.",
    },
    pt: {
      label: "Espaço privado",
      until: "Acesso até",
      hub: "Início do espaço",
      report: "Relatório do facilitador",
      leave: "Sair do espaço",
      leaving: "Saindo…",
      language: "Idioma",
      seatedName: "Este é o nome que você digitou ao entrar neste espaço.",
    },
  };

  var state = {
    joined: false,
    role: null,
    space: null,
    label: null,
    expiresAt: null,
    /**
     * The company's own wording for this page, or null for the shipped text.
     *
     * Null rather than an empty object, so assets/js/scenario-text.js can tell
     * "this space plays the standard scenarios" -- which is every space until
     * somebody reworded one in the admin console -- from "this space has a
     * rewrite that happens to be empty", and skip its work entirely in the first
     * case.
     */
    scenarioText: null,
  };
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

  /**
   * Which simulator this page is, from its own address.
   *
   * The nine pages live at /simulators/<language>/<slug>/, so the page does not
   * have to declare what it is. Read from the path rather than passed in from
   * each page for the same reason the strip's wording is held here: a per-page
   * copy is a per-page chance for one of the nine to be wrong.
   *
   * Empty on any other page -- the space hub, the gate -- which is what stops
   * those from asking for scenario wording they have no scenarios to apply.
   */
  function simulatorSlug() {
    var match = /\/simulators\/(?:en|es|pt)\/([a-z0-9-]+)\//.exec(window.location.pathname);
    return match ? match[1] : "";
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

  /**
   * The inputs the nine pages use to ask for a leaderboard name.
   *
   * Three different ids across nine files, because the pages were written
   * separately -- and one page carries the same id twice, once per screen, which
   * is why this is a querySelectorAll and not a getElementById. All three are
   * listed here rather than normalised in the pages: this is the only reader that
   * cares, and renaming an id in nine hand-written files to save two selectors is
   * a change with nine chances to break a page's own script.
   */
  var NAME_FIELDS = "input#playerNameInput, input#player-name-input, input#player-name";

  /**
   * Fills the leaderboard name in from the seat, and stops it being edited.
   *
   * A participant already typed their name to get into the space, and being
   * asked for it again by the exercise is both a repeat and a way for one person
   * to appear on their company's board under two names -- which now matters more
   * than it used to, because the name is what carries their progress from one
   * simulator to the next.
   *
   * The pages read `.value` at the moment they need it and never earlier, so
   * filling the field is enough: not one of the nine needs editing for this to
   * work. Read-only rather than hidden, so somebody who wonders what they will
   * be published as can see the answer.
   *
   * A seat with no name -- a sponsor who skipped the field, or a seat opened
   * before the name was required -- leaves the field alone and editable, which
   * is exactly the public behaviour.
   */
  function fillNameFields() {
    if (!state.label) return;
    var inputs = document.querySelectorAll(NAME_FIELDS);

    for (var index = 0; index < inputs.length; index += 1) {
      var input = inputs[index];
      if (input.value === state.label && input.readOnly) continue;
      // maxlength caps typing, not assignment, and the write path clamps to 60
      // anyway (assets/js/simulator-leaderboard.js), so a long seat name is
      // carried whole rather than cut to the page's own 30.
      input.value = state.label;
      input.readOnly = true;
      input.setAttribute("data-workspace-name", "true");
      input.title = copy().seatedName;
    }
  }

  /**
   * Keeps the name filled in on the pages that rebuild their own form.
   *
   * The Data Governance page holds two copies of the name field and re-renders
   * the block it lives in when a run ends, and the other two reveal theirs on a
   * screen that does not exist at load. An observer is the only thing that
   * covers all three without nine page edits; it does nothing on a public page,
   * because it is only ever started for a seated browser.
   */
  function watchNameFields() {
    if (!state.label || typeof MutationObserver !== "function") return;
    var pending = false;

    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      // Coalesced: a page re-rendering a panel fires this dozens of times in one
      // frame, and refilling one input is not worth doing dozens of times.
      window.setTimeout(function () {
        pending = false;
        fillNameFields();
      }, 50);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Moves the page's own header buttons into the strip.
   *
   * The public header is hidden inside a space (see the data-workspace rules in
   * assets/css/simulator-header.css), and on several of these pages it is not
   * only branding: it carries the sound toggle, the RACI guide, the leaderboard
   * button. Hiding it without this would take a working control off the screen
   * mid-exercise.
   *
   * Moved rather than rebuilt, so the handlers -- inline onclick attributes on
   * most of these pages -- come with them and this file needs to know nothing
   * about what any individual button does. The "main website" link is the one
   * thing deliberately left behind: inside a client's space, the way out is
   * their hub, not our marketing site.
   */
  function adoptHeaderActions(host) {
    var actions = document.querySelector(".simulator-header-actions");
    if (!actions) return;

    var home = actions.querySelector(".simulator-home-link");
    if (home && home.parentNode) home.parentNode.removeChild(home);

    actions.classList.add("workspace-banner-actions");
    host.appendChild(actions);
  }

  /**
   * The language switch, rebuilt in the strip.
   *
   * The footer nav that normally carries it is hidden along with the rest of the
   * public chrome, and a room is rarely monolingual -- the space has a language
   * but the three simulators exist in all of them, so losing the switch would
   * cost a participant the version they can actually read. The seat is a cookie
   * rather than a query string, so it survives the hop.
   */
  function renderLanguageSwitch(host) {
    var match = /\/simulators\/(en|es|pt)\/([a-z0-9-]+)\//.exec(window.location.pathname);
    if (!match) return;

    var current = match[1];
    var slug = match[2];
    var codes = ["en", "es", "pt"];
    var nav = element("nav", "workspace-banner-langs");
    nav.setAttribute("aria-label", copy().language);

    for (var index = 0; index < codes.length; index += 1) {
      var code = codes[index];
      var link = element("a", "workspace-banner-lang", code.toUpperCase());
      link.href = "/simulators/" + code + "/" + slug + "/";
      link.setAttribute("hreflang", code);
      if (code === current) {
        link.setAttribute("aria-current", "page");
        link.className += " workspace-banner-lang--current";
      }
      nav.appendChild(link);
    }

    host.appendChild(nav);
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

    renderLanguageSwitch(meta);
    inner.appendChild(meta);
    // Last, so the page's own controls sit at the end of the strip rather than
    // between the company's name and the way back to their hub.
    adoptHeaderActions(inner);
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
    // The head script's guess has been confirmed, so the guess can go: one
    // attribute means "seated" from here on, and nothing has to reason about
    // which of the two is the real one.
    document.documentElement.removeAttribute("data-workspace-pending");
    if (state.space.accentColor) {
      document.documentElement.style.setProperty("--workspace-accent", state.space.accentColor);
    }

    var run = function () {
      renderBanner();
      relabelBoard(state.space.company || state.space.displayName || "");
      fillNameFields();
      watchNameFields();
      document.dispatchEvent(new CustomEvent("workspace:ready", { detail: { space: state.space, role: state.role } }));
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }

  /**
   * Puts the public chrome back when this browser turns out not to be seated.
   *
   * The head script hides the header on a hint -- a `?space=` in the link or the
   * `dgj_space_hint` cookie -- and a hint can be wrong: a seat lapses, a space is
   * suspended, somebody keeps a bookmark. This is the correction, and it runs on
   * the answer from the server rather than on anything the browser believes.
   *
   * The stale hint is dropped with it, so the next load of any simulator does not
   * hide a header it is only going to have to put back. Deleting it needs no
   * Secure flag, which also means this works over plain http in local dev.
   */
  function releasePendingChrome(dropHint) {
    document.documentElement.removeAttribute("data-workspace-pending");
    if (dropHint && /(?:^|;\s*)dgj_space_hint=/.test(document.cookie)) {
      document.cookie = "dgj_space_hint=; Path=/; Max-Age=0; SameSite=Lax";
    }
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

    // Which page is asking, so a seated browser gets its company's wording back
    // on this same request. Rides along here rather than in a second fetch
    // because the first scenario renders as soon as the page boots, and a
    // separate round trip would be a visible wait before it.
    var query = [];
    if (requested) query.push("slug=" + encodeURIComponent(requested));
    var simulator = simulatorSlug();
    if (simulator) {
      query.push("simulator=" + encodeURIComponent(simulator));
      query.push("locale=" + encodeURIComponent(locale()));
    }

    var url = SESSION_ENDPOINT + (query.length ? "?" + query.join("&") : "");

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
            scenarioText: data.scenarioText && typeof data.scenarioText === "object" ? data.scenarioText : null,
          };
          apply();
          return state;
        }

        // Named a space, holds no seat in it: the gate is the next step, and it
        // is where the wording explaining any of this lives.
        if (requested && data && data.reason !== "other-space") {
          // Deliberately without releasePendingChrome(): this page is navigating
          // away, and unhiding a header on the way out is a flash of our brand
          // between a client's hub and their own gate.
          redirectToGate(requested);
          return state;
        }

        // The hint is only dropped when the server has actually said there is no
        // seat anywhere. "Seated in another space" is not that: the browser does
        // hold a seat, so the next simulator it opens inside its own space should
        // still hide the public header before the first paint.
        releasePendingChrome(!data || data.reason !== "other-space");
        return state;
      })
      .catch(function (error) {
        // A public page with a failed lookup is just a public page. The header
        // comes back, but the hint stays: a request that never arrived is no
        // evidence about the seat, and throwing the hint away on a blip would
        // cost a seated participant the pre-paint hide until they next rejoin.
        console.warn("Workspace context unavailable", error);
        releasePendingChrome(false);
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
    /** This space's rewritten wording for this page, or null for the shipped text. */
    scenarioText: function () {
      return state.scenarioText;
    },
  };
})();
