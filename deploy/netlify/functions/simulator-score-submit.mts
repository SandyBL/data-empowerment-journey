import type { Config } from "@netlify/functions";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions } from "../../db/schema.js";
import { normalizeSlug, resolveSession, spaceOffers } from "../lib/workspace-access.js";

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
// produced. Hence the per-simulator rules below: the full range each board can
// output, the step its scores move in (a tenth for Day-to-Day, a whole optimal
// choice for Data Literacy, a flat 100 for Ownership and CDMP), the data asset
// values Data Literacy can actually reach at each score, and — for private runs
// that send one — agreement between the score and its own per-dimension
// breakdown. Anything outside those is a forged or broken client. Together with
// the rate limit that is the whole defence, and it is proportionate — the prize
// for cheating here is a row in a table of job titles.
//
// The run duration is treated differently from the score: it decides ties, not
// rank, so a client that sends a nonsensical one loses its tie breaker instead
// of its publish. That includes a duration too short for a person to have read
// the questions — see cleanDuration below. The per-dimension breakdown is
// cleaned the same way (see cleanBreakdown); only a breakdown that contradicts
// the score it came with is a reason to refuse.
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
// The bounds below are a contract with twelve pages, and a simulator that starts
// producing a score outside its bound locks its best players out of the board
// permanently: they press Publish, get a 400, and no amount of retrying helps.
// That is not hypothetical — the Spanish and Portuguese ownership pages added a
// streak bonus that put a perfect run at 1900 against a bound of 1000, and
// because rejections were returned silently, the only trace was players
// reporting that saving did not work. Every rejection is now logged.

type SimulatorRules = {
  maxScore: number;
  // Scores are whole multiples of this. Checked with a float tolerance, because
  // Day-to-Day's one-decimal index arrives as a double.
  scoreStep: number;
  maxExtraScore: number | null;
  // Anything faster than this is not a person playing: roughly one second per
  // question or decision. Such a duration is dropped (null), not refused.
  minDurationMs: number;
};

const SIMULATORS = new Map<string, SimulatorRules>([
  // Weighted maturity index, 0-100 with one decimal: the five axes plus the
  // remaining budget, rescaled so the best reachable run is 100. Ten decisions.
  ["data-governance-day-to-day", { maxScore: 100, scoreStep: 0.1, maxExtraScore: null, minDurationMs: 10_000 }],
  // Optimal choices out of 15, plus the data asset value the run ended on. The
  // asset value is a third-place tie breaker (after score and duration) and is
  // checked against LITERACY_ASSET_RANGE below. Fifteen scenarios.
  ["data-literacy", { maxScore: 15, scoreStep: 1, maxExtraScore: 290_000, minDurationMs: 15_000 }],
  // Points out of 1000: ten scenarios, a flat 100 each, in all three languages.
  ["data-ownership-conflict", { maxScore: 1000, scoreStep: 100, maxExtraScore: null, minDurationMs: 10_000 }],
  // Points out of 1000: ten CDMP questions drawn from a hundred, a flat 100
  // each. The streak badge on that page is decoration and carries no bonus,
  // deliberately -- see the note above about the bound that locked players out.
  ["cdmp-exam-practice", { maxScore: 1000, scoreStep: 100, maxExtraScore: null, minDurationMs: 10_000 }],
]);

/**
 * The data asset values a Data Literacy run can end on, as [min, max] indexed
 * by its score (optimal choices, 0-15).
 *
 * Derived by enumerating the page itself rather than reasoned about: the fifteen
 * scenarios in simulators/{en,es,pt}/data-literacy/index.html (identical impacts
 * in all three languages) are played in a fixed order, the value starts at
 * 50,000, and each choice applies `Math.max(0, value + impact.asset)` — the
 * floor at zero is applied after every step, not once at the end. A dynamic
 * programme over (scenario, optimal choices so far) → set of reachable values
 * gives this table; every reachable value is a multiple of 5,000, and 290,000
 * is only reachable at 15/15. Re-derive it if a scenario's asset impact, the
 * starting value or the scenario order changes on those pages.
 */
const LITERACY_ASSET_RANGE: ReadonlyArray<readonly [number, number]> = [
  [0, 20_000], // 0
  [0, 50_000], // 1
  [0, 75_000], // 2
  [0, 100_000], // 3
  [0, 125_000], // 4
  [0, 150_000], // 5
  [0, 170_000], // 6
  [15_000, 190_000], // 7
  [40_000, 210_000], // 8
  [70_000, 225_000], // 9
  [100_000, 240_000], // 10
  [130_000, 250_000], // 11
  [165_000, 260_000], // 12
  [205_000, 270_000], // 13
  [245_000, 280_000], // 14
  [290_000, 290_000], // 15
];
const LITERACY_ASSET_STEP = 5_000;

/** Whether `value` is a whole multiple of `step`, allowing for float noise. */
const isMultipleOf = (value: number, step: number) => {
  const ratio = value / step;
  return Math.abs(ratio - Math.round(ratio)) < 1e-6;
};

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
 * among equal scores), so does one faster than a person could have read the
 * questions (`minDurationMs`, about a second per question) — which is the one
 * value a forged client would want to send — and an implausibly large one is
 * clamped.
 */
const cleanDuration = (value: unknown, minDurationMs: number) => {
  if (value === undefined || value === null) return null;
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < minDurationMs) return null;
  return Math.min(Math.round(duration), MAX_DURATION_MS);
};

/**
 * A display name is one line of text. Control characters, angle brackets and
 * runs of whitespace are collapsed rather than escaped: this board is rendered
 * by four different simulators across twelve pages, and a name that cannot carry
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
 * A malformed breakdown is never a reason to refuse a publish. Like the
 * duration, it costs the run its detail, not its place on the board: the
 * alternative is a player who finished a workshop exercise and cannot save it
 * because of a secondary field nobody looks at until the report is generated.
 * A well-formed one that contradicts its own score is different — see
 * breakdownContradicts.
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

/**
 * Whether a breakdown of percentages is consistent with `correct` items out of
 * `items` in total, where each key covers some number of those items.
 *
 * `totalsFor(percentage)` lists the (correct, total) pairs a key reporting that
 * percentage could have come from. The check is deliberately one-sided about
 * keys the breakdown does not carry: items not covered by any key may have gone
 * either way, so a partial breakdown is checked only as far as it goes, and a
 * complete one has to add up exactly.
 */
const countsFit = (
  percentages: number[],
  totalsFor: (percentage: number) => Array<[number, number]>,
  correct: number,
  items: number,
) => {
  // Reachable (items covered, correct among them) pairs after each key.
  let states = new Set<string>(["0:0"]);
  for (const percentage of percentages) {
    const options = totalsFor(percentage);
    const next = new Set<string>();
    for (const state of states) {
      const [covered, right] = state.split(":").map(Number);
      for (const [c, t] of options) {
        if (covered + t <= items) next.add(`${covered + t}:${right + c}`);
      }
    }
    if (!next.size) return false;
    states = next;
  }
  for (const state of states) {
    const [covered, right] = state.split(":").map(Number);
    if (right <= correct && correct <= right + (items - covered)) return true;
  }
  return false;
};

/** (correct, total) pairs with 1 <= total <= maxTotal that round to `percentage`. */
const ratiosFor = (percentage: number, minTotal: number, maxTotal: number) => {
  const pairs: Array<[number, number]> = [];
  for (let total = minTotal; total <= maxTotal; total += 1) {
    for (let right = 0; right <= total; right += 1) {
      if (Math.abs(Math.round((right / total) * 1000) / 10 - percentage) < 0.051) pairs.push([right, total]);
    }
  }
  return pairs;
};

/**
 * Whether a private run's breakdown says something its score cannot be.
 *
 * Only where the score is derivable from the breakdown: Ownership's is one key
 * per scenario at 0 or 100; Data Literacy's is five categories of three
 * scenarios; CDMP's is up to five knowledge-area groups whose sizes vary from
 * draw to draw but add up to the ten questions. Day-to-Day is skipped: its
 * score also depends on the remaining budget, which the breakdown does not
 * carry. Keys a simulator does not send today are ignored rather than refused.
 */
const breakdownContradicts = (simulator: string, score: number, breakdown: Record<string, number>) => {
  if (simulator === "data-ownership-conflict") {
    const scenarios = Object.entries(breakdown).filter(([key]) => /^scenario-\d+$/.test(key));
    if (!scenarios.length) return false;
    if (scenarios.some(([, value]) => value !== 0 && value !== 100)) return true;
    // One scenario per key, so a complete breakdown means score === 100 x the
    // scenarios answered correctly; scenarios it leaves out may have gone either way.
    const right = scenarios.filter(([, value]) => value === 100).length;
    const unreported = Math.max(0, 10 - scenarios.length);
    return score < right * 100 || score > (right + unreported) * 100;
  }

  if (simulator === "data-literacy") {
    const keys = ["governance", "bias", "ai", "analytics", "culture"];
    const values = keys.filter((key) => key in breakdown).map((key) => breakdown[key]);
    if (!values.length) return false;
    return !countsFit(values, (percentage) => ratiosFor(percentage, 3, 3), score, 15);
  }

  if (simulator === "cdmp-exam-practice") {
    const keys = ["foundations", "security", "architecture", "metadata", "quality"];
    const values = keys.filter((key) => key in breakdown).map((key) => breakdown[key]);
    if (!values.length) return false;
    return !countsFit(values, (percentage) => ratiosFor(percentage, 1, 10), score / 100, 10);
  }

  return false;
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
  const breakdown = cleanBreakdown(payload?.breakdown);
  const requestedSpace = normalizeSlug(payload?.space);

  if (!rules) return reject("Unknown simulator", { simulator });
  const durationMs = cleanDuration(payload?.durationMs, rules.minDurationMs);
  if (!LOCALES.has(locale)) return reject("Unknown locale", { simulator, locale });
  if (!playerName) return reject("Missing display name", { simulator, locale });

  if (!Number.isFinite(score) || score < 0 || score > rules.maxScore) {
    return reject("Score outside the simulator's range", { simulator, score, maxScore: rules.maxScore });
  }

  if (!isMultipleOf(score, rules.scoreStep)) {
    return reject("Score is not a value the simulator produces", { simulator, score, step: rules.scoreStep });
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

  if (simulator === "data-literacy" && extraScore !== null) {
    const [minAsset, maxAsset] = LITERACY_ASSET_RANGE[Math.round(score)];
    if (!isMultipleOf(extraScore, LITERACY_ASSET_STEP) || extraScore < minAsset || extraScore > maxAsset) {
      return reject("Extra score not reachable at this score", { simulator, score, extraScore, minAsset, maxAsset });
    }
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

  // A space offers the simulators it was sold with, and a run of any other one
  // would be a row on a board the hub never shows and a report section about an
  // exercise the client did not buy. Refused rather than sent to the public
  // board: the browser is seated, and its run is not the public's either.
  if (session && !spaceOffers(session.space, simulator)) {
    return Response.json(
      { error: "This simulator is not part of your space", reason: "not-in-space", retryable: false },
      { status: 403 },
    );
  }

  // Only private runs keep a breakdown, so only theirs is cross-checked: a
  // public run's breakdown is discarded unread and cannot mislead anybody.
  if (session && breakdown && breakdownContradicts(simulator, score, breakdown)) {
    return reject("Breakdown does not match the score", { simulator, score, breakdown });
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

  // The new row's id goes back with the board so the page can mark exactly that
  // row as the player's, rather than every row sharing their name and score.
  let insertedId: number | null = null;

  try {
    const [inserted] = await db.insert(simulatorScores).values({
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
      // The seat's department, so the report can group by it; NULL outside a
      // space that asks for one.
      department: session?.seat.department ?? null,
      // Kept for private runs only. The public board has nothing that reads a
      // breakdown, and the per-dimension detail of a stranger's run is data this
      // table would be storing for no reason — which is a poor look on a site
      // about data governance. Inside a space it is the report.
      breakdown: session ? breakdown : null,
    }).returning({ id: simulatorScores.id });
    insertedId = inserted?.id ?? null;
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
    { accepted: true, id: insertedId, scores, space: session?.space.slug ?? null },
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
