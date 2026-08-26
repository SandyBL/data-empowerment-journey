import type { Config } from "@netlify/functions";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores } from "../../db/schema.js";

// Publishes one finished simulator run to the global leaderboard.
//
// Scores are computed in the browser, so this endpoint cannot verify that a
// score was really earned — it can only refuse one the simulator could not have
// produced. Hence the per-simulator bounds below: they are the full range each
// board can output, and anything outside it is a forged or broken client.
// Together with the rate limit that is the whole defence, and it is
// proportionate — the prize for cheating here is a row in a table of job titles.
//
// Reads live in simulator-scores.mts on this same path. Keep the name and score
// rules here in step with the client-side checks in
// assets/js/simulator-leaderboard.js — the client's are a courtesy, these are
// the real ones.

const SIMULATORS = new Map<string, { maxScore: number; maxExtraScore: number | null }>([
  // Weighted maturity index, one decimal.
  ["data-governance-day-to-day", { maxScore: 100, maxExtraScore: null }],
  // Optimal choices out of 15, plus the data asset value ties are ranked on.
  ["data-literacy", { maxScore: 15, maxExtraScore: 100_000_000 }],
  // Points out of 1000.
  ["data-ownership-conflict", { maxScore: 1000, maxExtraScore: null }],
]);

const LOCALES = new Set(["en", "es", "pt"]);

const MAX_NAME_LENGTH = 60;
const TOP_N = 10;

/**
 * A display name is one line of text. Control characters, angle brackets and
 * runs of whitespace are collapsed rather than escaped: this board is rendered
 * by three different simulators across nine pages, and a name that cannot carry
 * markup in the first place stays safe in all of them regardless of how
 * carefully any one of those render paths escapes.
 */
const cleanName = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f<>]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_NAME_LENGTH)
    : "";

const topScores = (simulator: string) =>
  db
    .select({
      id: simulatorScores.id,
      name: simulatorScores.playerName,
      score: simulatorScores.score,
      extraScore: simulatorScores.extraScore,
      locale: simulatorScores.locale,
      createdAt: simulatorScores.createdAt,
    })
    .from(simulatorScores)
    .where(eq(simulatorScores.simulator, simulator))
    .orderBy(desc(simulatorScores.score), desc(simulatorScores.extraScore), asc(simulatorScores.createdAt))
    .limit(TOP_N);

export default async (request: Request) => {
  try {
    const payload = await request.json();
    const simulator = typeof payload?.simulator === "string" ? payload.simulator : "";
    const rules = SIMULATORS.get(simulator);
    const locale = typeof payload?.locale === "string" ? payload.locale.toLowerCase() : "";
    const playerName = cleanName(payload?.name);
    const score = Number(payload?.score);
    const hasExtra = payload?.extraScore !== undefined && payload?.extraScore !== null;
    const extraScore = hasExtra ? Number(payload.extraScore) : null;

    if (!rules || !LOCALES.has(locale) || !playerName) {
      return Response.json({ error: "Invalid submission" }, { status: 400 });
    }

    if (!Number.isFinite(score) || score < 0 || score > rules.maxScore) {
      return Response.json({ error: "Invalid score" }, { status: 400 });
    }

    if (
      extraScore !== null &&
      (rules.maxExtraScore === null ||
        !Number.isFinite(extraScore) ||
        extraScore < 0 ||
        extraScore > rules.maxExtraScore)
    ) {
      return Response.json({ error: "Invalid score" }, { status: 400 });
    }

    await db.insert(simulatorScores).values({
      simulator,
      locale,
      playerName,
      score,
      extraScore,
    });

    // The refreshed board comes back with the write. The page needs it to show
    // the player their new rank, and fetching it in a second request would race
    // the row that was just inserted.
    const scores = await topScores(simulator);

    return Response.json({ accepted: true, scores }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Logged rather than swallowed: without this, schema drift or a lost
    // database connection is indistinguishable from a malformed body, and the
    // only symptom anyone sees is a board that quietly stops growing.
    console.error("Leaderboard submission failed", error);
    return Response.json({ error: "Unable to save score" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/simulator-scores",
  method: ["POST"],
  // A run takes minutes to play. Ten in ten minutes covers someone replaying to
  // improve their rank and stays far below what makes stuffing the board worth
  // the trouble.
  rateLimit: {
    windowSize: 600,
    windowLimit: 10,
    aggregateBy: "ip",
  },
};
