import type { Config } from "@netlify/functions";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores } from "../../db/schema.js";
import { normalizeSlug, resolveSession } from "../lib/workspace-access.js";

// Reads one simulator's leaderboard. Writing is a separate function
// (simulator-score-submit.mts) on this same path, following the same split as
// the Confession Wall: reading happens on every page load, writing happens once
// at the end of a ten-minute run, and the two need rate limits an order of
// magnitude apart.
//
// There are two kinds of board and this function serves both. The public board
// is one worldwide pool per simulator, not one per language, and it is what
// every visitor sees. A private board belongs to one company's space and
// contains only runs published from inside it — that is the thing a client is
// buying, so which board a request gets is decided here, from the space cookie,
// and never from anything the page says about itself.
//
// A `space` parameter is a cross-check, not an instruction. The page sends the
// slug it believes it is showing, and a mismatch with the seat in the cookie is
// refused rather than quietly answered with the public board: a licence that
// lapsed halfway through a workshop would otherwise look to the room like their
// colleagues had vanished from the rankings.
//
// The profile or tier label is not returned because it is not stored — it is
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
  const requestedSpace = normalizeSlug(params.get("space"));

  if (!SIMULATORS.has(simulator)) {
    return Response.json({ error: "Unknown simulator" }, { status: 400 });
  }

  const requested = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : DEFAULT_LIMIT;

  try {
    const session = await resolveSession(request);

    if (requestedSpace && requestedSpace !== session?.space.slug) {
      // 403 with the reason, so the page can send the participant back to the
      // gate instead of rendering somebody else's rankings under their logo.
      return Response.json(
        { error: "Not a member of this space", reason: "no-seat" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    // A browser holding a seat is inside a space, so the private board is its
    // default board — including on the public simulator pages, which is the
    // point: for the length of the licence the simulators behave like the
    // company's own. NULL is the public pool, and an ordinary indexable value
    // in the composite index, so both cases are the same query shape.
    const board = session
      ? eq(simulatorScores.workspaceId, session.space.id)
      : isNull(simulatorScores.workspaceId);

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
      .where(and(eq(simulatorScores.simulator, simulator), board))
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
      { scores, space: session?.space.slug ?? null },
      {
        // The board changes whenever anyone finishes a run, and a player who
        // just submitted needs to see themselves in it. Private boards must not
        // be cached for a second reason: one cached response served to the next
        // visitor would be one company's rankings shown outside their space.
        headers: { "Cache-Control": "no-store", Vary: "Cookie" },
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
  // A page load makes one request, and finishing a run makes one more. The
  // window is sized for a room rather than a person: a workshop of thirty
  // people shares one office address, and each of them loads three simulators
  // and refreshes a board after every run, so a limit tuned to a single visitor
  // would blank the leaderboard for the back half of a paying client's session.
  // Ten a second sustained is still a hard ceiling on what one address can pull.
  rateLimit: {
    windowSize: 60,
    windowLimit: 600,
    aggregateBy: "ip",
  },
};
