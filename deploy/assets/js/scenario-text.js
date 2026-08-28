/**
 * Per-company scenario wording for the simulator pages.
 *
 * A company that licenses a private space can have the scenarios reworded to
 * their own systems, teams and vocabulary -- "our ERP" instead of "SAP", their
 * actual department names -- so the exercise reads like a Tuesday at their
 * office instead of a case study. This file is the last step of that: it takes
 * the wording the admin console saved, and rewrites the page's own scenario
 * objects with it just before the page boots.
 *
 * Only the words change, and that is a structural guarantee rather than a
 * promise. Three things enforce it, at three different points:
 *
 *   * the admin console can only edit whitelisted wording fields;
 *   * the save endpoint drops everything that is not one of them, so a payload
 *     carrying `impact` or `optimalChoice` never reaches the database;
 *   * and this file replaces a property only when it is on the whitelist below
 *     *and* already holds a non-empty string on the scenario being aimed at.
 *
 * The whitelist is the load-bearing half of that last check, and the structural
 * check on its own is not enough -- which is worth spelling out, because it is
 * not obvious. Some of the fields that decide the score are strings: Data
 * Literacy names its right answer as `optimalChoice: "A"` and Data Ownership as
 * `correctRole: "Data Steward"`. A rule that said only "replace strings with
 * strings" would happily rewrite both and quietly change what a run is scored
 * against. So the path has to be one this page is allowed to reword, and the
 * list of those is PATHS below, mirrored from netlify/lib/scenario-fields.mjs
 * and checked against it on every build by scripts/extract-simulator-text.mjs.
 *
 * So the scenario count, the options, which option is the good one and every
 * number a decision moves are the ones in the page. That is what makes a private
 * run comparable to a public one: the same score means the same thing, the
 * leaderboard bounds still hold, and the facilitator report still groups on the
 * same dimension keys.
 *
 * All or nothing, on purpose. Every replacement is worked out first and only
 * then written, so a single run never mixes rewritten scenarios with standard
 * ones -- a facilitator reading a report where half the wording is theirs and
 * half is ours cannot tell which half a participant was answering.
 *
 * And it never blocks. The lookup is given a few seconds, and the page boots
 * either way: a participant halfway into a workshop must not lose their exercise
 * because a request was slow, and the worst outcome of that is a private run
 * played in the standard wording, which is still a complete exercise.
 *
 * Deliberately a classic script rather than a module, matching
 * workspace-context.js: the callers are inline <script> blocks.
 */
(function () {
  "use strict";

  /**
   * How long the wording gets to arrive before the page boots without it.
   *
   * The request is already in flight by the time this runs -- workspace-context.js
   * starts it as soon as it loads, and the wording rides along in that same
   * response -- so this is the ceiling on an unusually slow network rather than a
   * budget for a round trip. Four seconds is long enough that a phone on a
   * conference centre's wifi still gets its company's wording, and short enough
   * that a participant staring at a page that has not started yet does not
   * conclude it is broken.
   */
  var TIMEOUT_MS = 4000;

  /**
   * Which paths of a scenario are wording, per simulator.
   *
   * A mirror of SCENARIO_FIELDS in netlify/lib/scenario-fields.mjs, holding the
   * paths and nothing else -- the browser has no use for the labels or the length
   * limits, which belong to the console and the save endpoint.
   *
   * Mirrored rather than fetched. A page in the middle of a workshop should not
   * be waiting on a second request to find out which of its own sentences are
   * sentences, and the two lists cannot drift: the build fails if they disagree.
   */
  var PATHS = {
    "data-governance-day-to-day": [
      "damaArea",
      "title",
      "description",
      "optionA.label",
      "optionB.label",
      "optionC.label",
      "optionA.text",
      "optionB.text",
      "optionC.text",
      "optionA.damaLesson",
      "optionB.damaLesson",
      "optionC.damaLesson",
      "optionA.insight",
      "optionB.insight",
      "optionC.insight",
    ],
    "data-literacy": [
      "topic",
      "text",
      "optionA.title",
      "optionB.title",
      "optionC.title",
      "optionA.lesson",
      "optionB.lesson",
      "optionC.lesson",
    ],
    "data-ownership-conflict": ["category", "task", "explanation"],
  };

  /**
   * The three pages whose scenarios are not shaped like their English original.
   *
   * The Portuguese Data Governance page keeps its options in an array, and both
   * translated Data Ownership pages call the task `title` and have no category.
   * See SCENARIO_FIELD_VARIANTS in netlify/lib/scenario-fields.mjs for why those
   * pages are described rather than made uniform.
   */
  var VARIANT_PATHS = {
    "data-governance-day-to-day": {
      pt: [
        "topic",
        "text",
        "options.0.title",
        "options.1.title",
        "options.2.title",
        "options.0.desc",
        "options.1.desc",
        "options.2.desc",
        "options.0.lesson",
        "options.1.lesson",
        "options.2.lesson",
      ],
    },
    "data-ownership-conflict": {
      es: ["title", "explanation"],
      pt: ["title", "explanation"],
    },
  };

  /**
   * Which page this is, from its own address.
   *
   * The nine pages live at /simulators/<language>/<slug>/, the same fact
   * workspace-context.js reads to ask for the wording in the first place. A page
   * anywhere else gets an empty list and rewrites nothing, which is the right
   * answer for a page that has no scenarios.
   */
  function allowedPaths() {
    var match = /\/simulators\/(en|es|pt)\/([a-z0-9-]+)\//.exec(window.location.pathname);
    if (!match) return [];
    var variant = VARIANT_PATHS[match[2]] && VARIANT_PATHS[match[2]][match[1]];
    return variant || PATHS[match[2]] || [];
  }

  /**
   * The scenario arrays this page has already settled.
   *
   * "Settled" means the wording either arrived and was written or is not coming,
   * so the next call can run straight through. Kept here rather than as a flag on
   * each of the nine pages, because the pages that start on a button press ask
   * this question on every press and the answer is the same one.
   */
  var settled = [];

  /**
   * Which key a scenario is stored under.
   *
   * Its own `id` where it has one, its position where it does not -- the
   * Portuguese Data Governance page numbers nothing. scripts/extract-simulator-text.mjs
   * derives the key exactly the same way, which is what makes an override typed
   * against a scenario in the console land on that same scenario here.
   */
  function scenarioKey(scenario, index) {
    var id = scenario && scenario.id;
    return String(typeof id === "number" && isFinite(id) ? id : index + 1);
  }

  /**
   * The object a dot path's last segment lives on, or null.
   *
   * Walks only through plain objects and arrays that are already there. A path
   * that does not lead anywhere returns null and is skipped rather than being
   * created, so a stale override -- one saved against a scenario shape the page
   * has since changed -- does nothing at all instead of adding a property the
   * page will never read.
   */
  function resolveOwner(scenario, path) {
    var parts = path.split(".");
    var node = scenario;

    for (var index = 0; index < parts.length - 1; index += 1) {
      if (!node || typeof node !== "object") return null;
      node = node[parts[index]];
    }

    return node && typeof node === "object" ? node : null;
  }

  /**
   * Every replacement this document asks for that the page can actually accept.
   *
   * Collected before anything is written, which is what makes the write
   * all-or-nothing, and counted so the console's "78 fields" and what a
   * participant actually reads can be reconciled from the browser console when
   * they ever disagree.
   */
  function planWrites(scenarios, overrides) {
    var allowed = allowedPaths();
    var writes = [];

    // No whitelist, nothing to rewrite. A page this file does not recognise is
    // left exactly as it shipped rather than edited on a guess.
    if (!allowed.length) return writes;

    for (var index = 0; index < scenarios.length; index += 1) {
      var scenario = scenarios[index];
      if (!scenario || typeof scenario !== "object") continue;

      var fields = overrides[scenarioKey(scenario, index)];
      if (!fields || typeof fields !== "object") continue;

      for (var path in fields) {
        if (!Object.prototype.hasOwnProperty.call(fields, path)) continue;

        var value = fields[path];
        if (typeof value !== "string" || !value) continue;

        // The scoring is not wording. Enforced here as well as at the save
        // endpoint, because this is the check that stands between a scenario
        // object and whatever reached the browser, whatever wrote it.
        if (allowed.indexOf(path) < 0) continue;

        var owner = resolveOwner(scenario, path);
        if (!owner) continue;

        var key = path.split(".").pop();
        // The whole guarantee, in one condition: a property that is not already
        // a non-empty string on this page is not wording, and is left alone.
        if (typeof owner[key] !== "string" || !owner[key]) continue;

        writes.push({ owner: owner, key: key, value: value });
      }
    }

    return writes;
  }

  /**
   * Rewrites the page's scenarios, then boots it -- exactly once, either way.
   *
   * `scenarios` is the page's own array, mutated in place, because every one of
   * these pages closes over that array from a dozen places and handing back a
   * copy would rewrite the wording of a set nothing renders.
   */
  function hydrate(scenarios, boot) {
    var booted = false;

    var start = function () {
      if (booted) return;
      booted = true;
      if (settled.indexOf(scenarios) < 0) settled.push(scenarios);
      boot();
    };

    if (!Array.isArray(scenarios) || typeof boot !== "function") {
      // Nothing to rewrite, or nothing to start. Either way this file has no
      // business being the reason a page does not run.
      if (typeof boot === "function") start();
      return;
    }

    var workspace = window.SimulatorWorkspace;
    if (!workspace || !workspace.ready || typeof workspace.ready.then !== "function") {
      start();
      return;
    }

    // The bound, applied to the wait rather than to the request: the fetch is
    // workspace-context.js's and carries the space branding too, so cancelling
    // it here would cost this page its client header as well as its wording.
    var timer = window.setTimeout(function () {
      console.warn("Scenario wording did not arrive in time; playing the standard scenarios");
      start();
    }, TIMEOUT_MS);

    workspace.ready
      .then(function (state) {
        if (booted) return;

        var overrides = state && state.scenarioText;
        if (!overrides || typeof overrides !== "object") return;

        var writes = planWrites(scenarios, overrides);
        for (var index = 0; index < writes.length; index += 1) {
          writes[index].owner[writes[index].key] = writes[index].value;
        }

        if (writes.length) {
          document.dispatchEvent(
            new CustomEvent("workspace:scenario-text", { detail: { fields: writes.length } }),
          );
        }
      })
      .catch(function (error) {
        // A private space that plays the standard wording is a working exercise.
        console.warn("Scenario wording unavailable", error);
      })
      .then(function () {
        window.clearTimeout(timer);
        start();
      });
  }

  window.SimulatorScenarioText = {
    /**
     * Applies this space's wording to `scenarios`, then calls `boot`.
     *
     * Call it in place of whatever started the page. `boot` runs exactly once,
     * whether the wording arrived, was refused, timed out or never existed.
     */
    hydrate: hydrate,

    /**
     * Whether this array is already carrying whatever wording it is going to get.
     *
     * For the pages that start on a button press. Those call their own start
     * function again once the wording has settled, and this is how the second
     * call knows to go through instead of waiting a second time.
     */
    isReady: function (scenarios) {
      return settled.indexOf(scenarios) > -1;
    },
  };
})();
