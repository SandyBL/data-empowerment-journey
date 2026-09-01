import type { Config } from "@netlify/functions";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions } from "../../db/schema.js";
import { normalizeSlug, resolveSession } from "../lib/workspace-access.js";

// Publishes one finished simulator run to a leaderboard.
//
// Which leaderboard is not the client's decision. A browser holding a valid
// space cookie publishes to that company's private board; everyone else
// publishes to the public one. The page may name the space it thinks it is in
// and a mismatch is refused outright, because the alternative — falling back to
// the public board when a licence lapses mid-run — would put a named employee
// of a client on a worldwide table they never agreed to appear on.
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
// of its publish. See cleanDuration below. The per-dimension breakdown is
// treated the same way — see cleanBreakdown.
//
// Inside a private space only one run per person per simulator is recorded: the
// first one they finish. A board a client paid for is worth what they can believe
// about it, and five rows from the same participant -- four of them practice --
// is not a leaderboard, it is a log. See firstAttemptTaken below for how a person
// is identified, and the partial unique index in db/schema.ts for why a check
// here is not the whole rule. The public board is unaffected: there is no
// identity out there to enforce anything against.
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
 * Bounds on the per-dimension breakdown. Five dimensions is what the simulators
 * report today; twelve leaves room for one to grow without a deploy here.
 */
const MAX_BREAKDOWN_KEYS = 12;

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

/**
 * The per-dimension breakdown, as `{ "<stable-key>": 0-100 }`, or null.
 *
 * This is what the facilitator report is built from: a score says a room did
 * badly, and this says it did badly at stewardship and fine at everything else.
 * The keys are the simulators' own internal identifiers, never their translated
 * labels, so the same dimension aggregates across a room that played in three
 * languages.
 *
 * Bounded but not enumerated. Shape is enforced here — a plain object, a capped
 * number of short identifier-shaped keys, each value a percentage — while the
 * meaning of a key is left to the simulator that sent it, so a simulator that
 * grows a sixth dimension does not have to wait for this file to be redeployed
 * before it can report it.
 *
 * Never a reason to refuse a publish. Like the duration, a malformed breakdown
 * costs the run its detail, not its place on the board: the alternative is a
 * player who finished a workshop exercise and cannot save it because of a
 * secondary field nobody looks at until the report is generated.
 */
const cleanBreakdown = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const cleaned: Record<string, number> = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (Object.keys(cleaned).length >= MAX_BREAKDOWN_KEYS) break;
    if (!/^[a-z][a-z0-9_-]{0,39}$/i.test(key)) continue;
    const percentage = Number(raw);
    if (!Number.isFinite(percentage)) continue;
    cleaned[key.toLowerCase()] = Math.round(Math.min(100, Math.max(0, percentage)) * 10) / 10;
  }

  return Object.keys(cleaned).length ? cleaned : null;
};

const topScores = (simulator: string, workspaceId: number | null) =>
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
    .where(
      and(
        eq(simulatorScores.simulator, simulator),
        // The same board the row was just written to, so the player sees their
        // own new rank and not a table they are absent from.
        workspaceId === null
          ? isNull(simulatorScores.workspaceId)
          : eq(simulatorScores.workspaceId, workspaceId),
      ),
    )
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
 * Whether a database error is Postgres saying "that row already exists".
 *
 * 23505 is the unique-violation class, and the only unique index a submission
 * can collide with is the one-attempt-per-person index. Read off the error
 * rather than inferred from the message, which is localised and version
 * dependent, and read defensively -- drizzle wraps the driver error, so the
 * cause is checked too.
 */
const isUniqueViolation = (error: unknown): boolean => {
  for (let current: unknown = error, depth = 0; current && depth < 4; depth += 1) {
    if (typeof current === "object" && (current as { code?: unknown }).code === "23505") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
};

/**
 * The run this person has already recorded on this board, or null.
 *
 * Identity is the seat's participant key, which is a hash of the space and the
 * name they typed at the gate -- so somebody who comes back tomorrow, on a new
 * seat in a new browser, is still the same person here. That is a weak identity
 * by design, and the same one the hub already uses to say which simulators
 * somebody has played: two people who type the same name in the same space count
 * as one, which is a real limitation of a room that recognises each other by
 * name, and the reason the gate asks for it rather than offering it.
 *
 * A seat with no key -- every seat opened before the name was required -- cannot
 * be held to the rule, so it keeps the old behaviour rather than being refused
 * outright. Refusing would lock a live workshop out of a board mid-session over
 * a column that was added after they joined.
 */
const firstAttemptTaken = async (workspaceId: number, simulator: string, participantKey: string) => {
  const [existing] = await db
    .select({
      score: simulatorScores.score,
      createdAt: simulatorScores.createdAt,
    })
    .from(simulatorScores)
    .where(
      and(
        eq(simulatorScores.workspaceId, workspaceId),
        eq(simulatorScores.simulator, simulator),
        eq(simulatorScores.participantKey, participantKey),
      ),
    )
    .limit(1);

  return existing ?? null;
};

/**
 * Tells a participant their first attempt is the one that counts.
 *
 * 409 rather than 400: the body is perfectly good, and the reason a retry cannot
 * help is the state of the board rather than anything wrong with the run. The
 * recorded score goes back with it so the page can say which run is standing
 * instead of only that this one is not, and the refreshed board goes back too --
 * a replay still deserves to see where the score it already has ranks.
 *
 * `reason` is what the client switches on; see assets/js/simulator-leaderboard.js.
 */
const refuseReplay = async (
  simulator: string,
  workspaceId: number,
  recorded: { score: number; createdAt: Date },
) => {
  let scores: Awaited<ReturnType<typeof topScores>> = [];

  try {
    scores = await topScores(simulator, workspaceId);
  } catch (error) {
    console.error("Leaderboard read failed while refusing a replay", error);
  }

  return Response.json(
    {
      accepted: false,
      error: "Only your first attempt is recorded in this space",
      reason: "already-recorded",
      recorded: { score: recorded.score, recordedAt: recorded.createdAt },
      scores,
      retryable: false,
    },
    { status: 409, headers: { "Cache-Control": "no-store" } },
  );
};

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
  const breakdown = cleanBreakdown(payload?.breakdown);
  const requestedSpace = normalizeSlug(payload?.space);

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

  let session: Awaited<ReturnType<typeof resolveSession>> = null;

  try {
    session = await resolveSession(request);
  } catch (error) {
    // A database hiccup while resolving the seat must not silently publish a
    // client's employee to the public board, so this is a retryable failure and
    // not a fallback.
    console.error("Workspace resolution failed during submission", error);
    return Response.json({ error: "Unable to save score", retryable: true }, { status: 503 });
  }

  if (requestedSpace && requestedSpace !== session?.space.slug) {
    console.warn(
      "Leaderboard submission rejected: space no longer available",
      JSON.stringify({ simulator, requestedSpace }),
    );
    return Response.json(
      { error: "Your access to this space has ended", reason: "no-seat", retryable: false },
      { status: 403 },
    );
  }

  const workspaceId = session?.space.id ?? null;
  // Null on the public board, and null for a seat that predates the name
  // requirement. Both mean "no person to hold to one attempt", which is why the
  // column is nullable and the unique index is partial.
  const participantKey = session?.seat.participantKey ?? null;

  if (workspaceId !== null && participantKey) {
    try {
      const recorded = await firstAttemptTaken(workspaceId, simulator, participantKey);
      if (recorded) return await refuseReplay(simulator, workspaceId, recorded);
    } catch (error) {
      // A failed check must not become a published second attempt, and it must
      // not become a lost first one either -- so this is retryable, and the
      // unique index is what decides the case where the check never ran.
      console.error("First-attempt check failed", error);
      return Response.json({ error: "Unable to save score", retryable: true }, { status: 503 });
    }
  }

  try {
    await db.insert(simulatorScores).values({
      simulator,
      locale,
      playerName,
      score,
      extraScore,
      durationMs,
      workspaceId,
      workspaceSessionId: session?.seat.id ?? null,
      // The person, not the seat: this is what the one-attempt rule is enforced
      // on, and what a run published from tomorrow's seat is matched against.
      participantKey,
      // Kept for private runs only. The public board has nothing that reads a
      // breakdown, and the per-dimension detail of a stranger's run is data this
      // table would be storing for no reason — which is a poor look on a site
      // about data governance. Inside a space it is the report.
      breakdown: session ? breakdown : null,
    });
  } catch (error) {
    // The one-attempt rule, arriving from the index rather than from the check
    // above. This is the case the check cannot see: two runs by the same person
    // in flight at once -- a results screen saving itself while the old publish
    // button is pressed in a second tab -- where both checks find an empty board
    // and only one insert can win. The loser is a replay, and is answered as
    // one, so nobody is told "could not be saved" about a board that holds their
    // score.
    if (isUniqueViolation(error) && workspaceId !== null && participantKey) {
      try {
        const recorded = await firstAttemptTaken(workspaceId, simulator, participantKey);
        if (recorded) return await refuseReplay(simulator, workspaceId, recorded);
      } catch (readError) {
        console.error("First-attempt read failed after a unique violation", readError);
      }
    }

    // Logged rather than swallowed: without this, schema drift or a lost
    // database connection is indistinguishable from a malformed body, and the
    // only symptom anyone sees is a board that quietly stops growing. 503
    // rather than 500 because the client retries this one.
    console.error("Leaderboard submission failed", error);
    return Response.json({ error: "Unable to save score", retryable: true }, { status: 503 });
  }

  // The row is committed from here on, so nothing below may report a failure.
  if (session) {
    try {
      await db
        .update(workspaceSessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(workspaceSessions.id, session.seat.id));
    } catch (error) {
      // Only affects the "active seats" figure on the facilitator report.
      console.error("Seat activity stamp failed after a successful save", error);
    }
  }

  // The refreshed board comes back with the write because the page needs it to
  // show the player their new rank, and fetching it in a second request would
  // race the row that was just inserted — but if that read fails, the score is
  // still saved, and answering "could not be saved" would send the player into
  // a retry that lands a duplicate row on the board. An empty list instead
  // tells the client to fetch the board on its own.
  let scores: Awaited<ReturnType<typeof topScores>> = [];

  try {
    scores = await topScores(simulator, workspaceId);
  } catch (error) {
    console.error("Leaderboard read failed after a successful save", error);
  }

  return Response.json(
    { accepted: true, scores, space: session?.space.slug ?? null },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
};

export const config: Config = {
  path: "/api/simulator-scores",
  method: ["POST"],
  // A run takes minutes to play, so ten per address per ten minutes was ample
  // for one visitor at home — and wrong for the case this feature exists for. A
  // workshop is thirty people on one office network finishing an exercise within
  // a few minutes of each other, and under the old limit the last twenty of them
  // would have been told their score could not be saved, in front of the client
  // who paid for the session. Ninety per ten minutes carries a large room
  // replaying an exercise, and stuffing a board at that rate still buys nothing
  // but rows in a table of job titles.
  rateLimit: {
    windowSize: 600,
    windowLimit: 90,
    aggregateBy: "ip",
  },
};
