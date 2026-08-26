/**
 * Global simulator leaderboard client.
 *
 * The three simulators each carry their own self-contained inline script, their
 * own scoring scale and their own markup, and they are duplicated across three
 * languages — nine pages in total. What they genuinely share is the trip to
 * /api/simulator-scores, so that is all this file holds: read the board, publish
 * a run, and the two text helpers every one of those render paths needs.
 *
 * Deliberately a classic script rather than a module, because the callers are
 * inline <script> blocks with onclick handlers that cannot import anything.
 *
 * Nothing here throws. A leaderboard is the last thing on a results page, and a
 * database that is briefly unreachable must not take the player's own score
 * report down with it — every call resolves to a result carrying an `error`
 * flag, and the pages fall back to a message in the table body.
 */
(function () {
  "use strict";

  var ENDPOINT = "/api/simulator-scores";

  // Matches the column width in db/schema.ts. The server truncates at the same
  // length; enforcing it here only saves the round trip.
  var MAX_NAME_LENGTH = 60;

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
          return { data: null, error: "rejected" };
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
    var url = ENDPOINT + "?simulator=" + encodeURIComponent(simulator);
    if (limit) url += "&limit=" + encodeURIComponent(limit);

    return requestJson(url, { headers: { Accept: "application/json" } }).then(function (result) {
      if (result.error) return { scores: [], error: result.error };
      var data = result.data || {};
      return { scores: Array.isArray(data.scores) ? data.scores : [], error: null };
    });
  }

  /**
   * Publishes a finished run and returns the refreshed board.
   *
   * `entry.extraScore` is optional and only meaningful for the boards that rank
   * ties on a second figure. Resolves to
   * { accepted: bool, scores: [...], error: null|"..." }; never rejects.
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

    return requestJson(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (result) {
      if (result.error) return { accepted: false, scores: [], error: result.error };

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

  window.SimulatorLeaderboard = {
    load: load,
    submit: submit,
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    MAX_NAME_LENGTH: MAX_NAME_LENGTH,
  };
})();
