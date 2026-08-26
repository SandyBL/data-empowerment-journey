import type { Config } from "@netlify/functions";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores } from "../../db/schema.js";

// Reads one simulator's global leaderboard. Writing is a separate function
// (simulator-score-submit.mts) on this same path, following the same split as
// the Confession Wall: reading happens on every page load, writing happens once
// at the end of a ten-minute run, and the two need rate limits an order of
// magnitude apart.
//
// The board is one worldwide pool per simulator, not one per language. The
// profile or tier label is not returned because it is not stored — it is
// derived from the score by the page, so every visitor reads the table in the
// language they opened it in.
//
// Equal scores are ranked fastest first, which is the whole reason durationMs
// comes back with each row: the boards that time themselves display it in a
// Time column so the order of two rows on the same score explains itself.

const SIMULATORS = new Set(["data-governance-day-to-day", "data-literacy", "data-ownership-conflict"]);

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export default async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const simulator = params.get("simulator") ?? "";

  if (!SIMULATORS.has(simulator)) {
    return Response.json({ error: "Unknown simulator" }, { status: 400 });
  }

  const requested = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : DEFAULT_LIMIT;

  try {
    const scores = await db
      .select({
        id: simulatorScores.id,
        name: simulatorScores.playerName,
        score: simulatorScores.score,
        extraScore: simulatorScores.extraScore,
        durationMs: simulatorScores.durationMs,
        locale: simulatorScores.locale,
        createdAt: simulatorScores.createdAt,
      })
      .from(simulatorScores)
      .where(eq(simulatorScores.simulator, simulator))
      // Ties break on how long the run took (fastest first, and ASC leaves the
      // untimed rows last), then on the secondary figure where a board has one,
      // then on who got there first, so a rank never reshuffles under a later
      // equal score.
      .orderBy(
        desc(simulatorScores.score),
        asc(simulatorScores.durationMs),
        desc(simulatorScores.extraScore),
        asc(simulatorScores.createdAt),
      )
      .limit(limit);

    return Response.json(
      { scores },
      {
        // The board changes whenever anyone finishes a run, and a player who
        // just submitted needs to see themselves in it.
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Leaderboard read failed", error);
    return Response.json({ error: "Unable to load leaderboard" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/simulator-scores",
  method: ["GET"],
  // A page load makes one request, and finishing a run makes one more. This is
  // generous enough that a shared office address never trips it while still
  // capping the queries a single address can force.
  rateLimit: {
    windowSize: 60,
    windowLimit: 60,
    aggregateBy: "ip",
  },
};
