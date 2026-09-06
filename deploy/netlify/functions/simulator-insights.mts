import type { Config } from "@netlify/functions";
import { desc, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores } from "../../db/schema.js";
import { summarizePublicBoards } from "../../assets/js/public-board-analysis.mjs";

// The aggregate behind /<lang>/simulator-results/: how the three public boards
// are distributed, as numbers.
//
// Three things make this a different endpoint from simulator-scores.mts rather
// than a parameter on it.
//
// It reads the public pool and nothing else, on purpose, and ignores the space
// cookie that the leaderboard is obliged to honour. The page it feeds contrasts
// what a public board can tell you with what a private one can, and a sponsor
// opening it from inside their own space has to see the public population --
// otherwise the comparison is against themselves.
//
// It returns no names. The leaderboard's whole content is the names people chose
// to publish; this is a distribution, and a row identifying anybody in it would
// be a use of their name they did not agree to when they typed it into a
// leaderboard.
//
// And it is cacheable, which the leaderboard is not. Nothing here changes the
// moment a visitor finishes a run, nobody is waiting to see themselves in it,
// and the numbers move slowly enough that a shared CDN copy is the right answer
// for a page that will be read far more often than it is written to.

/**
 * Ceiling on the rows one summary reads.
 *
 * The aggregation is done in memory rather than as grouped SQL because the
 * percentages, the bands and the medians all come off the same pass and the
 * shared module that computes them is also what runs in the browser. The cap
 * exists so that choice cannot fail silently: past it, the payload says it was
 * truncated rather than quietly describing the most recent slice of the board as
 * if it were the whole of it.
 */
const MAX_ROWS = 20000;

export default async () => {
  try {
    const rows = await db
      .select({
        simulator: simulatorScores.simulator,
        score: simulatorScores.score,
        durationMs: simulatorScores.durationMs,
        locale: simulatorScores.locale,
        createdAt: simulatorScores.createdAt,
      })
      .from(simulatorScores)
      // NULL is the public pool, not a missing value. See the schema note.
      .where(isNull(simulatorScores.workspaceId))
      // Newest first, so a truncated read is the current state of the board
      // rather than its first twenty thousand rows.
      .orderBy(desc(simulatorScores.createdAt))
      .limit(MAX_ROWS + 1);

    const truncated = rows.length > MAX_ROWS;
    const summary = summarizePublicBoards(truncated ? rows.slice(0, MAX_ROWS) : rows);

    return Response.json(
      { ...summary, truncated },
      {
        headers: {
          // Ten minutes in a browser, half an hour at the edge, and a stale copy
          // is served while the next one is fetched: a board that gained one run
          // is not worth making a reader wait for.
          "Cache-Control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("Public board summary failed", error);
    return Response.json({ error: "Unable to load the board summary" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/simulator-insights",
  method: ["GET"],
  // One request per page load, and the response is shared by every reader behind
  // the same edge node, so this only ever sees traffic the cache missed.
  rateLimit: {
    windowSize: 60,
    windowLimit: 120,
    aggregateBy: "ip",
  },
};
