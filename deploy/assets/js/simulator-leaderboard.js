/**
 * Global simulator leaderboard client.
 *
 * The three simulators each carry their own self-contained inline script, their
 * own scoring scale and their own markup, and they are duplicated across three
 * languages — nine pages in total. What they genuinely share is the trip to
 * /api/simulator-scores, so that is all this file holds: read the board, publish
 * a run, time a run, and the text helpers every one of those render paths needs.
 *
 * Deliberately a classic script rather than a module, because the callers are
 * inline <script> blocks with onclick handlers that cannot import anything.
 *
 * Nothing here throws. A leaderboard is the last thing on a results page, and a
 * database that is briefly unreachable must not take the player's own score
 * report down with it — every call resolves to a result carrying an `error`
 * flag, and the pages fall back to a message in the table body.
 *
 * There are two kinds of board behind that one endpoint. A visitor with no
 * private-space seat reads and writes the public board, exactly as before. A
 * participant inside a licensed company space reads and writes that company's
 * board instead, and this file's only part in that is to wait for
 * workspace-context.js to have settled the question and to pass the slug along
 * so the server can refuse a stale one. Which board a request lands on is
 * decided from the cookie, server-side; the slug below is a cross-check, never
 * an instruction, so a page cannot ask for a space it has no seat in.
 */
(function () {
  "use strict";

  var ENDPOINT = "/api/simulator-scores";

  // Matches the column width in db/schema.ts. The server truncates at the same
  // length; enforcing it here only saves the round trip.
  var MAX_NAME_LENGTH = 60;

  /**
   * Resolves once the private-space lookup has settled, or immediately when
   * there is no lookup to wait for.
   *
   * Read at call time rather than captured at load time, so the eight of the
   * nine pages that place this script before workspace-context.js work exactly
   * like the one that does not. A page with no space context at all -- which is
   * every page of the site until one is licensed -- takes the resolved branch
   * and behaves as it always did.
   */
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

  /** The space slug to send with a request, or null on the public board. */
  function workspaceSlug() {
    var workspace = window.SimulatorWorkspace;
    return workspace && typeof workspace.slug === "function" ? workspace.slug() : null;
  }

  // Waits before the second and third attempt. A publish happens once, at the
  // end of a run that took ten minutes to play, and the alternative to waiting
  // two seconds is telling the player their result is gone — so a cold function,
  // a rate limit or a database that is briefly unreachable is worth retrying
  // rather than handing back to them as a button to press again. Kept short
  // enough that the page never looks stuck behind its "Saving…" label.
  var RETRY_DELAYS_MS = [700, 2100];

  /**
   * Whether a second attempt at the identical request could plausibly succeed.
   *
   * A 4xx other than these is the server saying the body itself is wrong, which
   * is the one case where retrying is guaranteed to fail — the caller is told so
   * instead, so it never invites the player into a loop it knows cannot end.
   */
  function isRetryableStatus(status) {
    return status === 408 || status === 425 || status === 429 || status >= 500;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /**
   * One request to the leaderboard API, retried on the failures a retry can fix.
   *
   * Resolves to { data: <parsed body>, error: null }, or { data: null, error:
   * "unavailable" } once the attempts are used up, or { data: null, error:
   * "rejected" } if the server refused the body outright. Never rejects.
   */
  function requestJson(url, options) {
    var attempt = 0;

    function run() {
      return fetch(url, options)
        .then(function (response) {
          if (response.ok) {
            return response.json().then(function (data) {
              return { data: data, error: null };
            });
          }
          if (isRetryableStatus(response.status)) {
            if (attempt < RETRY_DELAYS_MS.length) return again(new Error("HTTP " + response.status));
            console.warn("Leaderboard unavailable after " + (attempt + 1) + " attempts: HTTP " + response.status);
            return { data: null, error: "unavailable" };
          }
          console.warn("Leaderboard refused the request: HTTP " + response.status);
          return { data: null, error: "rejected", status: response.status };
        })
        .catch(function (error) {
          // A network error, or a body that did not parse. Both are worth one
          // more try; neither tells us anything about the request itself.
          if (attempt < RETRY_DELAYS_MS.length) return again(error);
          console.warn("Leaderboard unavailable", error);
          return { data: null, error: "unavailable" };
        });
    }

    function again(error) {
      var delay = RETRY_DELAYS_MS[attempt];
      attempt += 1;
      console.warn("Leaderboard request failed, retrying in " + delay + "ms", error);
      return wait(delay).then(run);
    }

    return run();
  }

  /**
   * Reads the top of one simulator's board.
   *
   * Resolves to { scores: [...], error: null } or { scores: [], error: "..." }.
   * Never rejects.
   */
  function load(simulator, limit) {
    return workspaceReady().then(function () {
      var url = ENDPOINT + "?simulator=" + encodeURIComponent(simulator);
      if (limit) url += "&limit=" + encodeURIComponent(limit);
      var slug = workspaceSlug();
      if (slug) url += "&space=" + encodeURIComponent(slug);

      return requestJson(url, { headers: { Accept: "application/json" }, credentials: "same-origin" }).then(
        function (result) {
          if (result.error) {
            // 403 on a read means the seat this page was rendered under has
            // ended -- a licence that lapsed, or a facilitator who suspended the
            // space mid-session. Named separately from a generic refusal so a
            // page can say so instead of implying the board is broken.
            var reason = result.status === 403 ? "space-ended" : result.error;
            return { scores: [], error: reason, space: slug };
          }
          var data = result.data || {};
          return { scores: Array.isArray(data.scores) ? data.scores : [], error: null, space: data.space || null };
        }
      );
    });
  }

  /**
   * Publishes a finished run and returns the refreshed board.
   *
   * `entry.extraScore` is optional and only meaningful for the boards that rank
   * ties on a second figure; `entry.durationMs` is the timed length of the run,
   * also optional, and is what equal scores are ranked on. `entry.breakdown` is
   * the per-dimension result, `{ key: 0-100 }`, and is stored only for runs
   * published inside a private space -- it is what the facilitator report is
   * built from, and it is the one part of a run the public board has no use for.
   * Resolves to { accepted: bool, scores: [...], error: null|"..." }; never
   * rejects.
   */
  function submit(entry) {
    var name = String(entry.name || "").trim().slice(0, MAX_NAME_LENGTH);
    if (!name) {
      return Promise.resolve({ accepted: false, scores: [], error: "name-required" });
    }

    var body = {
      simulator: entry.simulator,
      locale: entry.locale,
      name: name,
      score: entry.score,
    };
    if (entry.extraScore !== undefined && entry.extraScore !== null) {
      body.extraScore = entry.extraScore;
    }
    // Omitted rather than sent as null when the caller has no reading — a run
    // whose clock never started must not claim to have taken zero time.
    if (typeof entry.durationMs === "number" && isFinite(entry.durationMs) && entry.durationMs >= 0) {
      body.durationMs = Math.round(entry.durationMs);
    }
    if (entry.breakdown && typeof entry.breakdown === "object") {
      body.breakdown = entry.breakdown;
    }

    return workspaceReady()
      .then(function () {
        var slug = workspaceSlug();
        if (slug) body.space = slug;

        return requestJson(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      })
      .then(function (result) {
        if (result.error) {
          // Same distinction as on the read, and it matters more here: the player
          // has just finished a run, and "your access to this space has ended" is
          // a sentence a facilitator can act on where "could not save" is not.
          var reason = result.status === 403 ? "space-ended" : result.error;
          return { accepted: false, scores: [], error: reason };
        }

        var data = result.data || {};
        var scores = Array.isArray(data.scores) ? data.scores : [];
        if (scores.length) return { accepted: true, scores: scores, error: null };

        // The score is saved — the row the player just created would be in this
        // list, so an empty one means the write succeeded but could not also
        // return the refreshed board. Read it separately rather than leaving them
        // looking at an empty table underneath their own successful publish.
        return load(entry.simulator, 10).then(function (board) {
          return { accepted: true, scores: board.scores, error: null };
        });
      });
  }

  /**
   * How long a run took, as the boards rank ties on it.
   *
   * Uses performance.now() where it exists because it is monotonic: a run is
   * timed across ten to fifteen minutes of somebody's afternoon, and Date.now()
   * moves when the clock is corrected or the machine comes back from sleep,
   * which is exactly how a run ends up reporting a negative or absurd duration.
   *
   * stop() freezes the reading, so a page can stop the clock on the last answer
   * and still read the same value later when the player presses Publish.
   * elapsedMs() returns null until the clock is started, which is what tells
   * submit() to leave the duration out of the payload entirely.
   */
  function createStopwatch() {
    var startedAt = null;
    var stoppedMs = null;

    function now() {
      return typeof performance !== "undefined" && performance && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    }

    return {
      start: function () {
        startedAt = now();
        stoppedMs = null;
      },
      stop: function () {
        if (startedAt !== null && stoppedMs === null) {
          stoppedMs = Math.max(0, Math.round(now() - startedAt));
        }
        return stoppedMs;
      },
      reset: function () {
        startedAt = null;
        stoppedMs = null;
      },
      /** Frozen duration once stopped, live duration while running, else null. */
      elapsedMs: function () {
        if (stoppedMs !== null) return stoppedMs;
        if (startedAt === null) return null;
        return Math.max(0, Math.round(now() - startedAt));
      },
    };
  }

  /**
   * Milliseconds to the m:ss the boards display, or h:mm:ss past an hour.
   *
   * Returns the em dash for anything unusable, which covers the rows published
   * before the boards were timed and the board that does not time itself — those
   * rows still have a name and a score to show.
   */
  function formatDuration(ms) {
    var value = Number(ms);
    if (ms === null || ms === undefined || !isFinite(value) || value < 0) return "—";

    var totalSeconds = Math.round(value / 1000);
    var seconds = totalSeconds % 60;
    var minutes = Math.floor(totalSeconds / 60) % 60;
    var hours = Math.floor(totalSeconds / 3600);

    function pad(number) {
      return number < 10 ? "0" + number : String(number);
    }

    return hours > 0 ? hours + ":" + pad(minutes) + ":" + pad(seconds) : minutes + ":" + pad(seconds);
  }

  /**
   * The names on the board are typed by other people, so every render path has
   * to escape them. The server strips angle brackets on the way in as well —
   * two layers, because there are nine pages doing the rendering and only one
   * of them has to forget.
   */
  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
    });
  }

  /** ISO timestamp from the API to the YYYY-MM-DD the boards display. */
  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  }

  /**
   * Bounds on a breakdown, matching the server's. Kept in step with
   * netlify/functions/simulator-score-submit.mts, which is where they are
   * enforced -- these only save a round trip.
   */
  var MAX_BREAKDOWN_KEYS = 12;

  /** A dimension key the server will accept, or "" if nothing usable is left. */
  function breakdownKey(value) {
    var key = String(value === undefined || value === null ? "" : value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    return /^[a-z]/.test(key) ? key : "";
  }

  function percentage(value) {
    var number = Number(value);
    if (!isFinite(number)) return null;
    return Math.round(Math.min(100, Math.max(0, number)) * 10) / 10;
  }

  /**
   * The per-dimension breakdown a private space's report is built from.
   *
   * The three simulators already compute this — they have to, to draw their own
   * results screen — but each holds it in its own shape: Data Literacy counts
   * optimal choices per category, Data Governance carries five 0-100 metrics,
   * Data Ownership has a correct/incorrect verdict per scenario. Rather than
   * teach nine pages a common format, this accepts all of those shapes and
   * returns the one the API stores:
   *
   *   { governance: 80, bias: 40, ... }               numbers, already 0-100
   *   { governance: { correct: 2, total: 3 }, ... }    counts
   *   { governance: { score: 8, max: 10 }, ... }       a score out of a maximum
   *   [{ isCorrect: true }, { isCorrect: false }]      one entry per question
   *
   * Keys are the simulators' internal identifiers and never their translated
   * labels, because a room that played in three languages has to aggregate into
   * one report. Returns null when there is nothing usable, which is the value
   * that makes submit() leave the field out entirely.
   */
  function categoryBreakdown(source, prefix) {
    if (!source || typeof source !== "object") return null;

    var breakdown = {};
    var count = 0;

    function add(key, value) {
      if (count >= MAX_BREAKDOWN_KEYS) return;
      var cleanKey = breakdownKey(key);
      var percent = percentage(value);
      if (!cleanKey || percent === null) return;
      if (!Object.prototype.hasOwnProperty.call(breakdown, cleanKey)) count += 1;
      breakdown[cleanKey] = percent;
    }

    if (Array.isArray(source)) {
      // One entry per question, in order. The index is the identity: "the room
      // got scenario 4 wrong" is a sentence a facilitator can use, and the
      // scenarios do not move between languages.
      for (var index = 0; index < source.length; index += 1) {
        var answer = source[index];
        var correct = answer === true || (answer && (answer.isCorrect === true || answer.correct === true));
        add((prefix || "q") + "-" + (index + 1), correct ? 100 : 0);
      }
      return count ? breakdown : null;
    }

    for (var key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
      var entry = source[key];

      if (typeof entry === "number") {
        add(key, entry);
        continue;
      }
      if (!entry || typeof entry !== "object") continue;

      var total = Number(entry.total !== undefined ? entry.total : entry.max);
      var achieved = Number(
        entry.correct !== undefined ? entry.correct : entry.score !== undefined ? entry.score : entry.value
      );
      if (isFinite(total) && total > 0 && isFinite(achieved)) add(key, (achieved / total) * 100);
      else if (isFinite(achieved)) add(key, achieved);
    }

    return count ? breakdown : null;
  }

  window.SimulatorLeaderboard = {
    load: load,
    submit: submit,
    createStopwatch: createStopwatch,
    formatDuration: formatDuration,
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    categoryBreakdown: categoryBreakdown,
    MAX_NAME_LENGTH: MAX_NAME_LENGTH,
  };
})();
