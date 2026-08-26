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
// The run duration is treated differently from the score: it decides ties, not
// rank, so a client that sends a nonsensical one loses its tie breaker instead
// of its publish. See cleanDuration below.
//
// Reads live in simulator-scores.mts on this same path. Keep the name and score
// rules here in step with the client-side checks in
// assets/js/simulator-leaderboard.js — the client's are a courtesy, these are
// the real ones.
//
// The bounds below are a contract with nine pages, and a simulator that starts
// producing a score outside its bound locks its best players out of the board
// permanently: they press Publish, get a 400, and no amount of retrying helps.
// That is not hypothetical — the Spanish and Portuguese ownership pages added a
// streak bonus that put a perfect run at 1900 against a bound of 1000, and
// because rejections were returned silently, the only trace was players
// reporting that saving did not work. Every rejection is now logged.

const SIMULATORS = new Map<string, { maxScore: number; maxExtraScore: number | null }>([
  // Weighted maturity index, one decimal.
  ["data-governance-day-to-day", { maxScore: 100, maxExtraScore: null }],
  // Optimal choices out of 15, plus the data asset value ties are ranked on.
  ["data-literacy", { maxScore: 15, maxExtraScore: 100_000_000 }],
  // Points out of 1000: ten scenarios, a flat 100 each, in all three languages.
  ["data-ownership-conflict", { maxScore: 1000, maxExtraScore: null }],
]);

const LOCALES = new Set(["en", "es", "pt"]);

const MAX_NAME_LENGTH = 60;
const TOP_N = 10;

/**
 * Ceiling on a reported run duration: twelve hours.
 *
 * The clock in the browser runs from the first question to the last answer, and
 * a tab left open over lunch reports a duration measured in hours. That is not a
 * forgery, it is just noise, so it is clamped rather than refused — a value over
 * the ceiling only has to sort behind every plausible run, and it already does.
 * Refusing it would cost the player their publish over something that has no
 * bearing on their score.
 */
const MAX_DURATION_MS = 12 * 60 * 60 * 1000;

/**
 * A reported duration, or null if there is nothing trustworthy to store.
 *
 * Unlike the score, an unusable duration is never a reason to reject: it is a
 * tie breaker, and a run with no duration still ranks correctly on score. So a
 * missing, negative, infinite or non-numeric value becomes null (ranked last
 * among equal scores) and an implausibly large one is clamped.
 */
const cleanDuration = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < 0) return null;
  return Math.min(Math.round(duration), MAX_DURATION_MS);
};

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
      durationMs: simulatorScores.durationMs,
      locale: simulatorScores.locale,
      createdAt: simulatorScores.createdAt,
    })
    .from(simulatorScores)
    .where(eq(simulatorScores.simulator, simulator))
    // Same ordering as the read function in simulator-scores.mts, and it has to
    // stay the same: this is the board the player sees their own new rank in.
    .orderBy(
      desc(simulatorScores.score),
      asc(simulatorScores.durationMs),
      desc(simulatorScores.extraScore),
      asc(simulatorScores.createdAt),
    )
    .limit(TOP_N);

/**
 * Refuses a submission, and says so in the log.
 *
 * A rejection is a player who finished a run, pressed Publish and cannot
 * succeed by trying again, so it is a fault worth seeing from this side rather
 * than only in somebody's browser console. The display name is deliberately
 * left out of the line: it is the one part of the payload a person typed.
 */
const reject = (reason: string, detail: Record<string, unknown>) => {
  console.warn("Leaderboard submission rejected:", reason, JSON.stringify(detail));
  // retryable tells the client whether a second attempt could ever succeed.
  return Response.json({ error: reason, retryable: false }, { status: 400 });
};

export default async (request: Request) => {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return reject("Malformed body", {});
  }

  const simulator = typeof payload?.simulator === "string" ? payload.simulator : "";
  const rules = SIMULATORS.get(simulator);
  const locale = typeof payload?.locale === "string" ? payload.locale.toLowerCase() : "";
  const playerName = cleanName(payload?.name);
  const score = Number(payload?.score);
  const hasExtra = payload?.extraScore !== undefined && payload?.extraScore !== null;
  const extraScore = hasExtra ? Number(payload.extraScore) : null;
  const durationMs = cleanDuration(payload?.durationMs);

  if (!rules) return reject("Unknown simulator", { simulator });
  if (!LOCALES.has(locale)) return reject("Unknown locale", { simulator, locale });
  if (!playerName) return reject("Missing display name", { simulator, locale });

  if (!Number.isFinite(score) || score < 0 || score > rules.maxScore) {
    return reject("Score outside the simulator's range", { simulator, score, maxScore: rules.maxScore });
  }

  if (
    extraScore !== null &&
    (rules.maxExtraScore === null ||
      !Number.isFinite(extraScore) ||
      extraScore < 0 ||
      extraScore > rules.maxExtraScore)
  ) {
    return reject("Extra score outside the simulator's range", {
      simulator,
      extraScore,
      maxExtraScore: rules.maxExtraScore,
    });
  }

  try {
    await db.insert(simulatorScores).values({
      simulator,
      locale,
      playerName,
      score,
      extraScore,
      durationMs,
    });
  } catch (error) {
    // Logged rather than swallowed: without this, schema drift or a lost
    // database connection is indistinguishable from a malformed body, and the
    // only symptom anyone sees is a board that quietly stops growing. 503
    // rather than 500 because the client retries this one.
    console.error("Leaderboard submission failed", error);
    return Response.json({ error: "Unable to save score", retryable: true }, { status: 503 });
  }

  // The row is committed from here on, so nothing below may report a failure.
  // The refreshed board comes back with the write because the page needs it to
  // show the player their new rank, and fetching it in a second request would
  // race the row that was just inserted — but if that read fails, the score is
  // still saved, and answering "could not be saved" would send the player into
  // a retry that lands a duplicate row on the board. An empty list instead
  // tells the client to fetch the board on its own.
  let scores: Awaited<ReturnType<typeof topScores>> = [];

  try {
    scores = await topScores(simulator);
  } catch (error) {
    console.error("Leaderboard read failed after a successful save", error);
  }

  return Response.json({ accepted: true, scores }, { status: 201, headers: { "Cache-Control": "no-store" } });
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
