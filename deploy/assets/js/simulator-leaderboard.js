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

  /**
   * Reads the top of one simulator's board.
   *
   * Resolves to { scores: [...], error: null } or { scores: [], error: "..." }.
   * Never rejects.
   */
  function load(simulator, limit) {
    var url = ENDPOINT + "?simulator=" + encodeURIComponent(simulator);
    if (limit) url += "&limit=" + encodeURIComponent(limit);

    return fetch(url, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        return { scores: Array.isArray(data.scores) ? data.scores : [], error: null };
      })
      .catch(function (error) {
        console.warn("Leaderboard unavailable", error);
        return { scores: [], error: "unavailable" };
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

    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        return { accepted: true, scores: Array.isArray(data.scores) ? data.scores : [], error: null };
      })
      .catch(function (error) {
        console.warn("Leaderboard submission failed", error);
        return { accepted: false, scores: [], error: "unavailable" };
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
