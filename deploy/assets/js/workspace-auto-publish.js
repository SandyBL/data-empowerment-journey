/**
 * Automatic score saving inside a private space.
 *
 * On the public simulators, publishing is a choice: the player types a name and
 * presses a button, because the name goes to a worldwide table and nobody is
 * owed a row on it. Inside a licensed company space that same choice is a hole.
 * A participant can play the same exercise five times, publish nothing, and
 * press Save only on the run where everything went right -- and the board the
 * client paid for then reports a room that got everything right. So in a space
 * the run is not the player's to withhold: the moment the results screen
 * appears, the score is saved under the name on their seat.
 *
 * The other half of the same rule: a space records one run per person per
 * simulator, and it is the first one they finish. Saving automatically stopped
 * anybody choosing which attempt gets published; this stops five attempts being
 * published at all, so a private board reads as what the room did rather than
 * what it eventually managed. The rule is enforced in the database and the
 * endpoint -- see the partial unique index in db/schema.ts -- and this file's
 * part is to ask before it saves, so a participant replaying an exercise is told
 * plainly that their first result still stands instead of being shown a failure.
 *
 * Public pages are untouched by this. finish() returns without doing anything
 * for a browser holding no seat, which is almost all traffic, and the page's own
 * publish form stays exactly as it always was.
 *
 * The nine pages keep their own publish functions rather than handing a payload
 * over to this file. Each one builds a different body -- Data Literacy carries a
 * data asset value and a stopwatch, Data Governance five metrics and no clock,
 * Who Owns This? one entry per scenario -- and each refreshes its own board
 * afterwards. Duplicating that here would be nine payloads to keep in step with
 * nine pages, and the first one to drift would publish a run with a missing
 * breakdown that nobody notices until a facilitator report comes out flat. So
 * this file drives the page's function instead: it decides *whether* and *when*,
 * and the page keeps deciding *what*.
 *
 * How the outcome comes back: assets/js/simulator-leaderboard.js announces every
 * publish on the document as `simulator:score-published`. That is the only way
 * to read the result of a page function that returns nothing, and it means a
 * page needs no second edit to report success or failure here.
 *
 * Nothing here throws. A participant who has just finished a fifteen-minute
 * exercise must never be shown a broken results screen because a status panel
 * failed to render, and a save that cannot be completed leaves the page's own
 * manual form standing so the run is still recoverable by hand.
 *
 * Deliberately a classic script rather than a module, matching
 * workspace-context.js and simulator-leaderboard.js: the callers are inline
 * <script> blocks.
 */
(function () {
  "use strict";

  /** Dispatched by assets/js/simulator-leaderboard.js after every publish. */
  var PUBLISH_EVENT = "simulator:score-published";

  /**
   * "Which simulators has this person already recorded in this space?"
   *
   * The same endpoint every page already calls on load, asked a second time with
   * progress=1 -- and asked here, at the end of the run, rather than at the
   * start. A page load happens before ten or fifteen minutes of playing, and the
   * answer that matters is the one that is true at the moment the score would be
   * written: somebody who finished this exercise in another tab while this run
   * was in progress has to be recognised. Costs one indexed read, once, on a
   * screen that has just finished a fifteen-minute exercise.
   */
  var PROGRESS_ENDPOINT = "/api/workspace/session?progress=1";

  /**
   * The manual publish controls on the nine pages, which a space hides.
   *
   * Five selectors because the pages were written separately and each named its
   * own form: three ids for the three simulators, plus the two the Spanish and
   * Portuguese ownership pages use. Listed here rather than normalised across
   * nine hand-written files, for the same reason the name fields are listed in
   * workspace-context.js -- this is the only reader that cares, and renaming an
   * id in nine files to save three selectors is a change with nine chances to
   * break a page's own script.
   *
   * Hidden, never removed: every one of these publish functions reads its name
   * input at the moment it runs, and a display:none input still carries its
   * value. Removing the form would take the name away from the very function
   * this file is about to call.
   */
  var MANUAL_CONTROLS = [
    "#leaderboardInputForm", // Data Literacy, all three languages
    "#leaderboard-submission-form", // Data Governance, en and es
    "#leaderboard-form-container", // Data Governance, pt
    "#publishScoreBtn", // Who Owns This?, en
    "#publish-score-btn", // Who Owns This?, es and pt
  ].join(", ");

  /**
   * Wording for the status panel, in the three languages the simulators exist in.
   *
   * Held here rather than passed in from each page because it is the same five
   * phrases on all nine of them, and a per-page copy is a per-page chance for
   * one of them to be left in English.
   */
  var COPY = {
    en: {
      label: "Private space",
      checking: "Checking what this space has already recorded for you…",
      saving: function (name) {
        return "Saving your result as " + name + "…";
      },
      recorded: function (score) {
        return (
          "Your first attempt is already recorded in this space" +
          (score ? ", with a score of " + score : "") +
          ". Only each person's first run of a simulator counts here, so this one was not saved."
        );
      },
      saved: function (name) {
        return "Result saved as " + name + ". Every finished run in this space is recorded automatically.";
      },
      failed: "Your result could not be saved, so nothing has been recorded for this run yet.",
      ended: "Your access to this space has ended, so this run could not be recorded. Ask your facilitator to reopen it.",
      retry: "Try saving again",
    },
    es: {
      label: "Espacio privado",
      checking: "Comprobando lo que este espacio ya tiene registrado a tu nombre…",
      saving: function (name) {
        return "Guardando tu resultado como " + name + "…";
      },
      recorded: function (score) {
        return (
          "Tu primer intento ya está registrado en este espacio" +
          (score ? ", con una puntuación de " + score : "") +
          ". Aquí solo cuenta la primera partida de cada simulador, así que esta no se guardó."
        );
      },
      saved: function (name) {
        return "Resultado guardado como " + name + ". Cada partida terminada en este espacio se registra automáticamente.";
      },
      failed: "No se pudo guardar tu resultado, así que todavía no hay nada registrado de esta partida.",
      ended: "Tu acceso a este espacio terminó, así que esta partida no pudo registrarse. Pide a tu facilitador que lo reabra.",
      retry: "Intentar guardar de nuevo",
    },
    pt: {
      label: "Espaço privado",
      checking: "Verificando o que este espaço já tem registrado no seu nome…",
      saving: function (name) {
        return "Salvando seu resultado como " + name + "…";
      },
      recorded: function (score) {
        return (
          "Sua primeira tentativa já está registrada neste espaço" +
          (score ? ", com pontuação de " + score : "") +
          ". Aqui só conta a primeira partida de cada simulador, então esta não foi salva."
        );
      },
      saved: function (name) {
        return "Resultado salvo como " + name + ". Cada partida concluída neste espaço é registrada automaticamente.";
      },
      failed: "Não foi possível salvar seu resultado, então ainda não há nada registrado desta partida.",
      ended: "Seu acesso a este espaço terminou, então esta partida não pôde ser registrada. Peça ao facilitador para reabri-lo.",
      retry: "Tentar salvar novamente",
    },
  };

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
   * The last publish the leaderboard announced.
   *
   * Read once, immediately after the page's publish function settles, and reset
   * before every attempt: a page function that returned without publishing --
   * an empty name, a run already saved -- leaves this null, which is how this
   * file tells "it failed" from "it never went".
   */
  var lastOutcome = null;

  document.addEventListener(PUBLISH_EVENT, function (event) {
    lastOutcome = (event && event.detail) || null;
  });

  var panel = null;
  var statusText = null;
  var retryButton = null;
  var hiddenControls = [];
  var inFlight = false;

  /** Resolves once the private-space lookup has settled, or immediately. */
  function workspaceReady() {
    var workspace = window.SimulatorWorkspace;
    if (!workspace || !workspace.ready || typeof workspace.ready.then !== "function") {
      return Promise.resolve(null);
    }
    return workspace.ready.then(
      function (state) {
        return state;
      },
      function () {
        return null;
      }
    );
  }

  /** The name on this seat, or "" when there is nothing to save a run under. */
  function seatName() {
    var workspace = window.SimulatorWorkspace;
    if (!workspace || typeof workspace.state !== "function") return "";
    var state = workspace.state();
    return state && state.joined && state.label ? String(state.label) : "";
  }

  /**
   * Whether this browser saves automatically, as far as it knows right now.
   *
   * Synchronous, so it is only meaningful once the space lookup has settled --
   * which it has by the time a run ends, and has not while the page is still
   * booting. Exposed for a page that wants to word its results screen
   * differently inside a space; finish() does not rely on it.
   */
  function isAutomatic() {
    return seatName() !== "";
  }

  /** Which simulator this page is, as the API names it, or "". */
  function simulatorSlug() {
    var workspace = window.SimulatorWorkspace;
    return workspace && typeof workspace.simulator === "function" ? workspace.simulator() : "";
  }

  /**
   * A score as a participant should read it back.
   *
   * The three boards run on three scales -- 0-100 to one decimal, 0-15 whole, and
   * 0-1000 whole -- so one decimal place with a bare integer left bare covers all
   * of them without this file having to know which page it is on.
   */
  function formatScore(value) {
    var score = Number(value);
    if (!isFinite(score)) return "";
    return String(Math.round(score * 10) / 10);
  }

  /**
   * This person's already-recorded run of this simulator, or null.
   *
   * Null covers three different things on purpose: nothing recorded yet, no
   * simulator to ask about, and a lookup that failed. All three mean the same
   * thing to the caller -- go ahead and try to save -- because the rule is
   * enforced by the endpoint and the unique index behind it, and this lookup only
   * exists so that a replay is told the truth by this panel rather than by the
   * page's own "could not save" alert. A lookup that cannot answer must never
   * cost somebody their first attempt.
   */
  function recordedRun(simulator) {
    if (!simulator) return Promise.resolve(null);

    return fetch(PROGRESS_ENDPOINT, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (data) {
        var progress = data && Array.isArray(data.progress) ? data.progress : [];
        for (var index = 0; index < progress.length; index += 1) {
          if (progress[index] && progress[index].simulator === simulator) return progress[index];
        }
        return null;
      })
      .catch(function (error) {
        console.warn("Could not read what this space has recorded", error);
        return null;
      });
  }

  function hideManualControls() {
    var nodes = document.querySelectorAll(MANUAL_CONTROLS);
    hiddenControls = [];

    for (var index = 0; index < nodes.length; index += 1) {
      var node = nodes[index];
      node.setAttribute("data-workspace-autosave-hidden", "true");
      node.style.display = "none";
      hiddenControls.push(node);
    }

    return hiddenControls.length ? hiddenControls[0] : null;
  }

  /**
   * Puts the page's own form back.
   *
   * Only ever called when the publish never happened -- the page function
   * returned early, or threw -- because a participant who has finished a run
   * must be left with some way to record it rather than a panel reporting a
   * state this file cannot explain.
   */
  function restoreManualControls() {
    for (var index = 0; index < hiddenControls.length; index += 1) {
      hiddenControls[index].removeAttribute("data-workspace-autosave-hidden");
      hiddenControls[index].style.display = "";
    }
    hiddenControls = [];

    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    statusText = null;
    retryButton = null;
  }

  /** Whether a node this file is holding is still on the page. */
  function inDocument(node) {
    if (!node) return false;
    return typeof node.isConnected === "boolean" ? node.isConnected : document.contains(node);
  }

  /** The status panel, in place of the form the page shipped with. */
  function mount(publish) {
    // Three of these simulators can be replayed without a page load, and they
    // rebuild their results screen when they are -- which throws away the panel
    // from the previous run while this file is still holding a reference to it.
    // Writing status into a detached node would leave a participant with no
    // message at all, and leaving the old nodes in hiddenControls would leave the
    // freshly rendered publish form visible, so both are dropped and rebuilt.
    if (panel && !inDocument(panel)) {
      panel = null;
      statusText = null;
      retryButton = null;
      hiddenControls = [];
    }

    // Still on the page: the form beside it may not be, so hide it again.
    if (panel) {
      hideManualControls();
      return panel;
    }

    var host = hideManualControls();
    if (!host || !host.parentNode) return null;

    var words = copy();

    panel = document.createElement("div");
    panel.className = "workspace-autosave";
    panel.setAttribute("role", "status");
    // Polite rather than assertive: this is a confirmation, and a screen reader
    // interrupting the results the participant is being read is worse than the
    // confirmation arriving a moment later.
    panel.setAttribute("aria-live", "polite");

    var label = document.createElement("span");
    label.className = "workspace-autosave-label";
    label.textContent = words.label;
    panel.appendChild(label);

    statusText = document.createElement("p");
    statusText.className = "workspace-autosave-text";
    panel.appendChild(statusText);

    retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "workspace-autosave-retry";
    retryButton.textContent = words.retry;
    retryButton.hidden = true;
    retryButton.addEventListener("click", function () {
      run(publish);
    });
    panel.appendChild(retryButton);

    host.parentNode.insertBefore(panel, host);
    return panel;
  }

  function setStatus(state, text, offerRetry) {
    if (!panel) return;
    panel.setAttribute("data-state", state);
    // textContent throughout: the one variable in these strings is a name
    // somebody typed at the gate, and it has no business being parsed as markup.
    if (statusText) statusText.textContent = text;
    if (retryButton) retryButton.hidden = !offerRetry;
  }

  /**
   * One automatic attempt at the page's own publish function.
   *
   * The page function is trusted with the payload and the board refresh and
   * distrusted about nothing else: it may resolve without publishing, and it may
   * throw. Both end the same way -- the panel goes, the form comes back, and the
   * participant can still save the run by hand.
   */
  function run(publish) {
    if (inFlight) return Promise.resolve(false);
    inFlight = true;
    lastOutcome = null;

    var words = copy();
    var name = seatName();
    setStatus("saving", words.saving(name), false);

    // The seat name, on the page's own field, at the last possible moment. The
    // observer in workspace-context.js refills that field on a delay after a
    // results screen re-renders it, and one of these pages clears it after a
    // publish -- so a replay would otherwise be saved under whatever the page
    // left behind. See fillNameFields there.
    var workspace = window.SimulatorWorkspace;
    if (workspace && typeof workspace.applyName === "function") {
      try {
        workspace.applyName();
      } catch (error) {
        /* A name that could not be refilled is caught by the outcome below. */
      }
    }

    return Promise.resolve()
      .then(function () {
        return publish();
      })
      .then(
        function () {
          return lastOutcome;
        },
        function (error) {
          console.warn("Automatic save failed inside the page's publish function", error);
          return null;
        }
      )
      .then(function (outcome) {
        inFlight = false;

        if (outcome && outcome.accepted) {
          setStatus("saved", words.saved(name), false);
          return true;
        }

        if (outcome) {
          // Refused because this person already has a run on this board, which
          // the check in finish() did not see -- the two-tabs case, where the
          // other tab recorded a run in the seconds since.
          // Reported as the fact it is and not as a failure -- there is nothing
          // to retry, and their result is safely recorded.
          if (outcome.error === "already-recorded") {
            var recorded = outcome.recorded || null;
            setStatus("recorded", words.recorded(recorded ? formatScore(recorded.score) : ""), false);
            return false;
          }

          var ended = outcome.error === "space-ended";
          setStatus("failed", ended ? words.ended : words.failed, !ended);
          return false;
        }

        // Never reached the leaderboard at all, so there is nothing to report
        // and no reason to keep the participant's own form hidden.
        restoreManualControls();
        return false;
      });
  }

  /**
   * Called by a page at the end of its results function.
   *
   * `publish` is that page's own publish function, called with no arguments.
   * Resolves to true when the run was recorded, false in every other case,
   * including the two ordinary ones: a public visitor, for whom this does nothing
   * at all and the page's publish button stays exactly where it was, and a
   * participant replaying an exercise they have already recorded, who is told so
   * and whose page function is never called.
   */
  function finish(publish) {
    if (typeof publish !== "function") return Promise.resolve(false);

    return workspaceReady()
      .then(function (state) {
        // No seat: the public board, the public button, the public choice.
        if (!state || !state.joined) return false;
        // A seat with no name -- a sponsor who joined before the field was
        // required -- has nothing to attribute a run to, so it keeps the manual
        // form rather than publishing something nobody can be recognised by.
        if (!seatName()) return false;

        // A page with no form for the panel to stand in for is still a page
        // whose run gets saved -- mount() returning null costs the participant
        // the confirmation, not the record.
        mount(publish);

        // Asked before saving so that a replay is never handed to the page's own
        // publish function: six of the nine pages alert() when a publish does not
        // succeed, and a rule working as designed must not come out as a browser
        // dialog saying the score could not be saved. The manual form stays
        // hidden either way -- pressing it would meet the same refusal.
        var words = copy();
        setStatus("checking", words.checking, false);

        return recordedRun(simulatorSlug()).then(function (recorded) {
          if (recorded) {
            setStatus("recorded", words.recorded(formatScore(recorded.bestScore)), false);
            return false;
          }
          return run(publish);
        });
      })
      .catch(function (error) {
        console.warn("Automatic save skipped", error);
        return false;
      });
  }

  window.SimulatorAutoPublish = {
    finish: finish,
    isAutomatic: isAutomatic,
  };
})();
