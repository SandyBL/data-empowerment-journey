import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions } from "../../db/schema.js";
import { publicSpace, resolveSession, spaceSimulators } from "../lib/workspace-access.js";
// The pillar mapping, the ownership role table and the English dimension labels
// the CSV needs. Shared with the report page rather than restated here; see the
// header of that file for why it is plain .mjs.
import {
  BAND_LABELS,
  BANDS,
  DIMENSION_LABELS,
  MAX_SCORES,
  OWNERSHIP_SCENARIO_ROLES,
  PILLAR_LABELS,
  PILLAR_ORDER,
  PILLAR_SOURCES,
  PROFILE_LABELS,
  ROLE_LABELS,
  TIEBREAK_ORDER,
  dimensionLabel,
  pillarContributions,
} from "../../assets/js/simulator-analysis.mjs";

// The facilitator report: the one thing a private space has that no amount of
// playing the public simulators can give a client.
//
// A public leaderboard answers "who won". This answers the question a Head of
// Data actually has after a workshop — where is this room weak, how many of them
// finished, and how far apart the strongest and the weakest are — and it answers
// it from the runs their own people published, inside their own space, and nobody
// else's.
//
// Three layers, deliberately in this order, because that is the order a sponsor
// reads them in:
//
//   * an executive summary across all four simulators, which is one index, one
//     profile and a five-pillar organisational reading;
//   * one panel per simulator, which is the room-level equivalent of the report
//     each player got on their own results screen: the room's profile, what it is
//     strong at, what it is weak at, and how much it disagreed with itself;
//   * the raw distribution and dimension detail underneath, unchanged.
//
// Everything above is derived here and worded on the page. This endpoint emits
// numbers plus stable keys — band keys, dimension keys, pillar keys — and never a
// sentence, because the same payload is rendered in three languages and exported
// to a CSV that has no language at all. The one exception is the CSV itself,
// which is written in English because a spreadsheet has no locale to read.
//
// Every figure below is one run per person per simulator: a space records the
// first attempt somebody finishes and refuses the rest, so an average is an
// average of first attempts rather than of however many tries each person felt
// like publishing. That is what makes a weak dimension here worth acting on. The
// "runs" and "people" counts are kept apart all the same — they diverge across
// simulators, and a room where twelve people played one exercise and three played
// all four is a fact a facilitator should be able to see.
//
// Sponsor seats only. The participant code and the sponsor code are different
// codes precisely so that the room can compete on the board without every
// person in it being able to read how the room scored as a whole; a
// participant's cookie gets a 403 here even though it is a perfectly valid seat
// in the same space.
//
// Everything is aggregate except the leaderboard names the participants already
// chose to publish. There is no per-person profile in here and no way to build
// one: `?format=csv` exports exactly the rows the board already displays, the
// run's own dimension detail, and the same aggregates the page shows — which is
// what a client needs to paste into their own follow-up plan.

/**
 * Ceiling on the rows one report reads.
 *
 * A space is a workshop, or a quarter of workshops, so this is a few hundred
 * rows in practice and the aggregation is cheap to do in memory — which is why
 * it is done that way rather than as five separate grouped queries plus a
 * jsonb_each_text roll-up. The cap exists so that assumption cannot fail
 * silently: past it, the report says it was truncated instead of quietly
 * describing part of the room.
 */
const MAX_ROWS = 5000;

/** Seats are one row per browser that joined; a large room is tens of them. */
const MAX_SEATS = 2000;

/** A seat counts as active if it published something in the last two hours. */
const ACTIVE_WINDOW_MS = 2 * 60 * 60 * 1000;

// MAX_SCORES and BANDS used to be declared here. They now come from the
// analysis module above, because the public board summary needs the same two
// tables and a third copy of a scoring scale is how one of them goes wrong: the
// day the ownership simulator's ceiling changes, a report and a benchmark that
// disagree about it are worse than either alone.

/**
 * Each simulator's own profile thresholds, in that simulator's own scoring units.
 *
 * The room panel has to carry the same verdict the room itself was given: a
 * participant who read "Governance Practitioner" on their screen should not find
 * their room described by a scale invented here. So the room profile is derived
 * from these — the exact cut-offs the twelve simulator pages use — and the generic
 * BANDS above are left to do the one job they are honest at, which is comparing
 * across simulators.
 *
 * In raw score units rather than percentages on purpose. Data Literacy bands at
 * 13, 10 and 6 out of 15, which are 86.67%, 66.67% and 40% — thresholds that
 * only survive the round trip through a percentage if nobody ever touches the
 * rounding. `exclusive` marks the ownership boundaries, whose page reads
 * `score <= 400` and `score <= 700`, so 700 is a Practitioner and not a Master.
 * CDMP Exam Practice bands on the certification's own pass marks instead of a
 * curve of its own: 80% for Master, 70% for Practitioner, 60% for Associate.
 *
 * All four sets are now the same in all three languages: the Portuguese
 * Day-to-Day page banded at 85/65 until this change and now bands at 75/50 with
 * English and Spanish, so one room profile can be stated without asking which
 * language the room happened to play in.
 */
const PROFILE_BANDS = new Map<string, { key: string; min: number; exclusive?: boolean }[]>([
  [
    "data-governance-day-to-day",
    [
      { key: "leader", min: 75 },
      { key: "reactive", min: 50 },
      { key: "firefighter", min: 0 },
    ],
  ],
  [
    "data-literacy",
    [
      { key: "champion", min: 13 },
      { key: "strategist", min: 10 },
      { key: "tactical", min: 6 },
      { key: "hoarder", min: 0 },
    ],
  ],
  [
    "data-ownership-conflict",
    [
      { key: "master", min: 700, exclusive: true },
      { key: "practitioner", min: 400, exclusive: true },
      { key: "rookie", min: 0 },
    ],
  ],
  [
    "cdmp-exam-practice",
    [
      { key: "master", min: 800 },
      { key: "practitioner", min: 700 },
      { key: "associate", min: 600 },
      { key: "revision", min: 0 },
    ],
  ],
]);

/**
 * Where a dimension stops being a gap and starts being a strength.
 *
 * Sixty per cent, which is the line the Data Literacy results screen already
 * draws between its "strengths" and "key areas for development" lists. Reused
 * rather than re-chosen so that a participant reading their own report and a
 * sponsor reading the room's report are working from the same idea of good.
 */
const STRENGTH_THRESHOLD = 60;

/**
 * How many people a simulator needs before the report calls its reading a
 * baseline rather than an indication.
 *
 * Five is not a statistical claim. It is the point below which one person having
 * a bad afternoon moves the room average by more than the room average is worth,
 * and the report says so instead of handing a client a confident number built
 * from three runs.
 */
const BASELINE_PARTICIPANTS = 5;

/** Values this close to the ends count as a right or a wrong answer. */
const EPSILON = 0.05;

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

const round = (value: number, places = 1) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** mm:ss, or "" when a run carries no timing. */
const formatClock = (ms: number | null) =>
  ms === null ? "" : `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

/** The band key a simulator's own results screen would show for this score. */
const profileBand = (simulator: string, score: number) => {
  const bands = PROFILE_BANDS.get(simulator);
  if (!bands) return null;
  const band = bands.find((candidate) => (candidate.exclusive ? score > candidate.min : score >= candidate.min));
  return band ? band.key : null;
};

/**
 * One cell of CSV, quoted, with formula characters defused.
 *
 * A display name is free text somebody typed, and a spreadsheet treats a cell
 * beginning with =, +, - or @ as a formula to run. Prefixing the value keeps it
 * readable as text in Excel, Numbers and Sheets alike. Escaping only the quotes
 * would be correct CSV and still hand the client a workbook that executes what
 * a participant typed.
 */
const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
};

const csvRow = (cells: unknown[]) => cells.map(csvCell).join(",");

/**
 * Which person a run belongs to, most reliable handle first.
 *
 * The participant key is the one that survives a room coming back the next
 * morning: two seats opened a day apart under the same name are one person, and
 * counting them as two used to inflate every headcount in this report by however
 * many people rejoined. The seat is the fallback for runs published before the
 * name was required, and the display name is the last resort for a run whose
 * seat row is gone -- both of which keep the count honest for old data rather
 * than collapsing it to one.
 */
const runIdentity = (run: { participantKey: string | null; sessionId: number | null; name: string }) =>
  run.participantKey ? `pk:${run.participantKey}` : run.sessionId !== null ? `seat:${run.sessionId}` : `name:${run.name}`;

/**
 * A fixed order for dimension keys, used only to break ties between equally
 * weak (or equally strong) dimensions.
 *
 * The rows arrive newest first, so ordering ties by first appearance made "the
 * weakest dimension" depend on which participant happened to publish last -- a
 * report refreshed after one more run could swap its headline without any
 * average changing. The order is the simulator's own dimension list in
 * DIMENSION_LABELS (which is also the order its results screen draws them in),
 * with any key not listed there after it, alphabetically.
 */
const dimensionRank = (simulator: string) => {
  const known = Object.keys((DIMENSION_LABELS.en as Record<string, Record<string, string>>)[simulator] ?? {});
  return (a: string, b: string) => {
    const first = known.indexOf(a);
    const second = known.indexOf(b);
    if (first !== -1 || second !== -1) {
      if (first === -1) return 1;
      if (second === -1) return -1;
      return first - second;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  };
};

/** Fixed order for the ownership roles, for the same reason as dimensionRank. */
const ROLE_ORDER = ["business", "steward", "it"];
const roleRank = (a: string, b: string) => {
  const first = ROLE_ORDER.indexOf(a);
  const second = ROLE_ORDER.indexOf(b);
  return (first === -1 ? ROLE_ORDER.length : first) - (second === -1 ? ROLE_ORDER.length : second) || (a < b ? -1 : a > b ? 1 : 0);
};

type ReportRun = {
  simulator: string;
  name: string;
  score: number;
  extraScore: number | null;
  durationMs: number | null;
  locale: string;
  breakdown: unknown;
  sessionId: number | null;
  participantKey: string | null;
  department: string | null;
  createdAt: Date;
};

/**
 * Everything the report says, from the runs a space published.
 *
 * Split out of the handler because both response formats need all of it: the CSV
 * used to be a flat dump of rows and is now the same three layers the page
 * renders, and computing them twice from two slightly different loops is how the
 * export and the screen end up disagreeing in front of a client.
 */
const SIMULATOR_ORDER = [...MAX_SCORES.keys()];

const buildAnalysis = (runs: ReportRun[], offered: string[]) => {
  const perSimulator = new Map<
    string,
    {
      simulator: string;
      runs: number;
      participants: Set<number | string>;
      scores: number[];
      percents: number[];
      durations: number[];
      bands: Map<string, number>;
      dimensions: Map<
        string,
        { total: number; runs: number; min: number; max: number; ceiling: number; floor: number; binary: boolean }
      >;
      roles: Map<string, { total: number; answers: number; scenarios: Set<number> }>;
      firstRunAt: Date;
      lastRunAt: Date;
    }
  >();

  // Pillar readings are pooled across every simulator, which is the whole point:
  // one organisational profile out of four exercises that each see part of it.
  const pillars = new Map<string, { value: number; weight: number; runs: number; simulators: Set<string> }>();

  // Who played what, so the summary can say how much of the room the index
  // actually describes rather than implying it covers everybody.
  const playedBy = new Map<string, Set<string>>();

  for (const run of runs) {
    let bucket = perSimulator.get(run.simulator);

    if (!bucket) {
      bucket = {
        simulator: run.simulator,
        runs: 0,
        participants: new Set(),
        scores: [],
        percents: [],
        durations: [],
        bands: new Map(BANDS.map((band) => [band.key, 0])),
        dimensions: new Map(),
        roles: new Map(),
        firstRunAt: run.createdAt,
        lastRunAt: run.createdAt,
      };
      perSimulator.set(run.simulator, bucket);
    }

    bucket.runs += 1;
    // People, not seats: somebody who played this simulator twice across two
    // sittings is one participant here, which is what a facilitator counting
    // heads in the room expects to read.
    const identity = runIdentity(run);
    bucket.participants.add(identity);
    bucket.scores.push(run.score);
    if (run.durationMs !== null) bucket.durations.push(run.durationMs);
    if (run.createdAt < bucket.firstRunAt) bucket.firstRunAt = run.createdAt;
    if (run.createdAt > bucket.lastRunAt) bucket.lastRunAt = run.createdAt;

    const played = playedBy.get(identity) ?? new Set<string>();
    played.add(run.simulator);
    playedBy.set(identity, played);

    const maxScore = MAX_SCORES.get(run.simulator);
    if (maxScore) {
      const percent = Math.min(100, Math.max(0, (run.score / maxScore) * 100));
      bucket.percents.push(percent);
      const band = BANDS.find((candidate) => percent >= candidate.from && percent < candidate.to);
      if (band) bucket.bands.set(band.key, (bucket.bands.get(band.key) ?? 0) + 1);
    }

    if (run.breakdown && typeof run.breakdown === "object") {
      for (const [key, value] of Object.entries(run.breakdown as Record<string, unknown>)) {
        const percentage = Number(value);
        if (!Number.isFinite(percentage)) continue;

        const dimension = bucket.dimensions.get(key) ?? {
          total: 0,
          runs: 0,
          min: percentage,
          max: percentage,
          ceiling: 0,
          floor: 0,
          binary: true,
        };
        dimension.total += percentage;
        dimension.runs += 1;
        dimension.min = Math.min(dimension.min, percentage);
        dimension.max = Math.max(dimension.max, percentage);
        if (percentage >= 100 - EPSILON) dimension.ceiling += 1;
        else if (percentage <= EPSILON) dimension.floor += 1;

        // A scenario key is one dispute somebody either called correctly or did
        // not, so "6 of 11 got this right" is a truer sentence about it than
        // "average 55%". Only scenario keys: a Day-to-Day dimension that happens
        // to have landed on 0 and 100 twice is still an average of several
        // decisions, and counting it as a right answer would be a claim the data
        // does not make.
        const scenario = /^scenario-(\d+)$/.exec(key);
        if (!scenario || (percentage > EPSILON && percentage < 100 - EPSILON)) dimension.binary = false;
        bucket.dimensions.set(key, dimension);

        // The ownership simulator has no dimensions, only ten disputes, so its
        // one aggregate worth reading is by accountable role: a room at 90% on
        // the IT scenarios and 40% on the Business Owner ones is not weak at
        // ownership, it sends anything technical-sounding to IT.
        const role = scenario ? OWNERSHIP_SCENARIO_ROLES[Number(scenario[1])] : null;
        if (role) {
          const entry = bucket.roles.get(role) ?? { total: 0, answers: 0, scenarios: new Set<number>() };
          entry.total += percentage;
          entry.answers += 1;
          entry.scenarios.add(Number(scenario[1]));
          bucket.roles.set(role, entry);
        }
      }

      for (const [pillar, contribution] of Object.entries(pillarContributions(run.simulator, run.breakdown))) {
        const entry = pillars.get(pillar) ?? { value: 0, weight: 0, runs: 0, simulators: new Set<string>() };
        entry.value += contribution.value;
        entry.weight += contribution.weight;
        entry.runs += 1;
        entry.simulators.add(run.simulator);
        pillars.set(pillar, entry);
      }
    }
  }

  const simulators = [...perSimulator.values()]
    .map((bucket) => {
      // The profile is assigned from the exact average, not the displayed one:
      // a Day-to-Day room averaging 74.96 is a Reactive room, and rounding it
      // to 75.0 first would have called it a Leader one.
      const exactAverageScore = bucket.scores.reduce((sum, score) => sum + score, 0) / bucket.runs;
      const averageScore = round(exactAverageScore);
      const byKey = dimensionRank(bucket.simulator);
      const averagePercent = bucket.percents.length
        ? round(bucket.percents.reduce((sum, percent) => sum + percent, 0) / bucket.percents.length)
        : null;
      const minPercent = bucket.percents.length ? round(Math.min(...bucket.percents)) : null;
      const maxPercent = bucket.percents.length ? round(Math.max(...bucket.percents)) : null;

      return {
        simulator: bucket.simulator,
        runs: bucket.runs,
        participants: bucket.participants.size,
        maxScore: MAX_SCORES.get(bucket.simulator) ?? null,
        averageScore,
        bestScore: Math.max(...bucket.scores),
        averagePercent,
        minPercent,
        maxPercent,
        // How far apart the strongest and the weakest run in the room are, which
        // is the difference between a room that needs teaching and a room that
        // needs aligning.
        spreadPercent: minPercent !== null && maxPercent !== null ? round(maxPercent - minPercent) : null,
        // The room's own profile, on this simulator's own scale.
        bandKey: profileBand(bucket.simulator, exactAverageScore),
        // A simulator that reports no timings has no median, and null is what the
        // page renders as an em dash. It used to send nothing here and get
        // rendered as 0:00, which reads as a room that finished instantly.
        medianDurationMs: median(bucket.durations),
        bands: BANDS.map((band) => ({ ...band, count: bucket.bands.get(band.key) ?? 0 })),
        // Weakest first. This ordering is the report's actual recommendation:
        // the top entry is the dimension a follow-up session should open with.
        dimensions: [...bucket.dimensions.entries()]
          .map(([key, dimension]) => {
            const average = round(dimension.total / dimension.runs);
            return {
              key,
              average,
              runs: dimension.runs,
              strong: average >= STRENGTH_THRESHOLD,
              min: round(dimension.min),
              max: round(dimension.max),
              binary: dimension.binary,
              correctRuns: dimension.binary ? dimension.ceiling : null,
            };
          })
          // Ties on the displayed average go to a fixed key order rather than
          // to whichever row happened to come first; see dimensionRank.
          .sort((a, b) => a.average - b.average || byKey(a.key, b.key)),
        roles: bucket.roles.size
          ? [...bucket.roles.entries()]
              .map(([key, entry]) => ({
                key,
                average: round(entry.total / entry.answers),
                answers: entry.answers,
                scenarios: entry.scenarios.size,
              }))
              .sort((a, b) => a.average - b.average || roleRank(a.key, b.key))
          : null,
        firstRunAt: bucket.firstRunAt,
        lastRunAt: bucket.lastRunAt,
      };
    })
    .sort((a, b) => b.runs - a.runs);

  const measurable = simulators.filter((entry) => entry.averagePercent !== null);
  // Each simulator counts once, not once per run. A room where twelve people
  // played one exercise and three played another has not become mostly about the
  // first one.
  const index = measurable.length
    ? round(measurable.reduce((sum, entry) => sum + (entry.averagePercent ?? 0), 0) / measurable.length)
    : null;

  const pillarRows = PILLAR_ORDER.map((key) => {
    const entry = pillars.get(key);
    const measured = Boolean(entry && entry.weight > 0);
    return {
      key,
      measured,
      average: measured ? round(entry!.value / entry!.weight) : null,
      runs: entry ? entry.runs : 0,
      // Which of the four exercises produced this reading, and — when there is
      // none — which one would.
      measuredBy: entry ? [...entry.simulators] : [],
      // Only the simulators this space actually offers: recommending an
      // exercise the client did not buy is advice nobody in the room can take.
      sources: (PILLAR_SOURCES[key] ?? []).filter((slug: string) => offered.includes(slug)),
    };
  });

  const rankOf = (key: string) => {
    const position = TIEBREAK_ORDER.indexOf(key);
    return position === -1 ? TIEBREAK_ORDER.length : position;
  };
  const measuredPillars = pillarRows.filter((row) => row.measured);
  const weakestPillar =
    [...measuredPillars].sort((a, b) => (a.average ?? 0) - (b.average ?? 0) || rankOf(a.key) - rankOf(b.key))[0]?.key ??
    null;
  const strongestPillar =
    [...measuredPillars].sort((a, b) => (b.average ?? 0) - (a.average ?? 0) || rankOf(a.key) - rankOf(b.key))[0]?.key ??
    null;

  const widest = [...simulators]
    .filter((entry) => entry.spreadPercent !== null && entry.runs > 1)
    .sort(
      (a, b) =>
        (b.spreadPercent ?? 0) - (a.spreadPercent ?? 0) ||
        SIMULATOR_ORDER.indexOf(a.simulator) - SIMULATOR_ORDER.indexOf(b.simulator),
    )[0];

  const smallestGroup = simulators.length ? Math.min(...simulators.map((entry) => entry.participants)) : 0;

  return {
    simulators,
    participants: new Set(runs.map(runIdentity)),
    executive: {
      index,
      // The cross-simulator index is the one number in the report that spans
      // three different scales, so it is banded with the comparable BANDS rather
      // than with any one simulator's profile.
      bandKey: index === null ? null : (BANDS.find((band) => index >= band.from && index < band.to)?.key ?? null),
      simulatorsCounted: measurable.length,
      // The simulators this space offers, not the four that exist: a space sold
      // with two of them has played "2 of 2", not "2 of 4".
      simulatorsAvailable: offered.length,
      pillars: pillarRows,
      strongestPillar,
      weakestPillar,
      // Unmeasured and coverable: a simulator in this space would read it.
      unmeasuredPillars: pillarRows.filter((row) => !row.measured && row.sources.length).map((row) => row.key),
      // Unmeasured and not coverable here, said separately so the page does not
      // recommend playing something this space does not have.
      uncoveredPillars: pillarRows.filter((row) => !row.measured && !row.sources.length).map((row) => row.key),
      coverage: {
        people: playedBy.size,
        playedAll: [...playedBy.values()].filter((played) => offered.every((slug) => played.has(slug))).length,
        playedOne: [...playedBy.values()].filter((played) => played.size === 1).length,
      },
      widestSpread: widest
        ? {
            simulator: widest.simulator,
            spreadPercent: widest.spreadPercent,
            minPercent: widest.minPercent,
            maxPercent: widest.maxPercent,
          }
        : null,
      smallestGroup,
      confidence: smallestGroup >= BASELINE_PARTICIPANTS ? "baseline" : "indicative",
    },
  };
};

/** The label runs without a department are grouped under. */
const NO_DEPARTMENT = "";

/**
 * The same analysis, once per department, plus a ranking across them.
 *
 * Built by running buildAnalysis over each department's own runs rather than by
 * a second, smaller aggregation, so a department's panel is computed by exactly
 * the code that computes the room's -- same thresholds, same bands, same
 * tie-breaks -- and the two can never disagree about what "weak" means.
 *
 * The ranking orders on the department index, which is the mean of the
 * department's per-simulator averages, the same way the room index is built.
 * Two departments that played different simulators are not strictly
 * comparable on it, so each row carries how many simulators it covers and the
 * per-simulator averages it is made of, and the page shows both.
 *
 * Runs with no department -- a sponsor who did not pick one, or a seat opened
 * before the space asked -- are reported as a count, not as a department of
 * their own, so they cannot top a ranking nobody in the room is part of.
 */
const buildDepartments = (runs: ReportRun[], offered: string[], departments: string[]) => {
  const byDepartment = new Map<string, ReportRun[]>(departments.map((name) => [name, []]));
  let unassigned = 0;

  for (const run of runs) {
    const name = run.department && byDepartment.has(run.department) ? run.department : NO_DEPARTMENT;
    if (name === NO_DEPARTMENT) {
      unassigned += 1;
      continue;
    }
    byDepartment.get(name)!.push(run);
  }

  const rows = [...byDepartment.entries()].map(([department, deptRuns]) => {
    const analysis = buildAnalysis(deptRuns, offered);
    return {
      department,
      runs: deptRuns.length,
      people: analysis.participants.size,
      executive: analysis.executive,
      simulators: analysis.simulators,
    };
  });

  const played = rows
    .filter((row) => row.runs > 0)
    .sort(
      (a, b) =>
        (b.executive.index ?? -1) - (a.executive.index ?? -1) ||
        b.people - a.people ||
        departments.indexOf(a.department) - departments.indexOf(b.department),
    );

  return {
    // Ranked: every department with at least one run, best index first.
    ranking: played.map((row, position) => ({ ...row, rank: position + 1 })),
    // Listed in the space, but nobody from them has published yet.
    notYetPlayed: rows.filter((row) => row.runs === 0).map((row) => row.department),
    unassignedRuns: unassigned,
  };
};

/**
 * The export, in two halves.
 *
 * The first is one row per published run, in the order they were published, and
 * is what it always was. The second is every aggregate the page renders, because
 * a sponsor who exports rather than prints was otherwise handed the raw rows and
 * asked to rebuild the analysis they had just been reading.
 *
 * English throughout: a CSV has no locale, and the alternative — translating the
 * export into the space's language — would hand a Portuguese client a file whose
 * column headers no longer match the one their colleague exported.
 */
const buildCsv = (
  runs: ReportRun[],
  analysis: ReturnType<typeof buildAnalysis>,
  departments: ReturnType<typeof buildDepartments> | null,
) => {
  const lines: string[] = [];

  lines.push(csvRow(["Published runs"]));
  lines.push(
    csvRow([
      "Published at",
      "Simulator",
      "Participant",
      "Score",
      "Max score",
      "Percent",
      "Duration (mm:ss)",
      "Language",
      ...(departments ? ["Department"] : []),
      "Dimensions",
    ]),
  );

  for (const run of runs) {
    const maxScore = MAX_SCORES.get(run.simulator) ?? null;
    const percent = maxScore ? round((run.score / maxScore) * 100) : "";
    // Dimensions are flattened into a single readable column rather than spread
    // across one column per key: the four simulators do not share dimensions,
    // and a sparse forty-column sheet is harder to read than a short label list.
    // Labels rather than keys, so that "scenario-4 0%" reads as the firewall
    // question it actually was.
    const dimensions = run.breakdown
      ? Object.entries(run.breakdown as Record<string, number>)
          .map(([key, value]) => `${dimensionLabel(run.simulator, key, "en")} ${value}%`)
          .join("; ")
      : "";

    lines.push(
      csvRow([
        run.createdAt.toISOString(),
        run.simulator,
        run.name,
        run.score,
        maxScore ?? "",
        percent,
        formatClock(run.durationMs),
        run.locale,
        ...(departments ? [run.department ?? ""] : []),
        dimensions,
      ]),
    );
  }

  const { executive, simulators } = analysis;

  lines.push("");
  lines.push(csvRow(["Executive summary"]));
  lines.push(csvRow(["Metric", "Value"]));
  lines.push(csvRow(["Organisational index (0-100)", executive.index ?? ""]));
  lines.push(
    csvRow([
      "Overall profile",
      executive.bandKey ? (BAND_LABELS.en[executive.bandKey] ?? executive.bandKey) : "",
    ]),
  );
  lines.push(csvRow(["Simulators played", `${executive.simulatorsCounted} of ${executive.simulatorsAvailable}`]));
  lines.push(csvRow(["People who published a run", executive.coverage.people]));
  lines.push(csvRow([`People who played all ${executive.simulatorsAvailable}`, executive.coverage.playedAll]));
  lines.push(csvRow(["People who played only one", executive.coverage.playedOne]));
  lines.push(
    csvRow([
      "Widest spread within one simulator",
      executive.widestSpread
        ? `${executive.widestSpread.simulator}: ${executive.widestSpread.minPercent}% to ${executive.widestSpread.maxPercent}%`
        : "",
    ]),
  );
  lines.push(
    csvRow([
      "Reading strength",
      executive.confidence === "baseline"
        ? `Baseline (smallest group ${executive.smallestGroup} ${executive.smallestGroup === 1 ? "person" : "people"})`
        : `Indicative only (smallest group ${executive.smallestGroup} ${
            executive.smallestGroup === 1 ? "person" : "people"
          }, ${BASELINE_PARTICIPANTS} needed)`,
    ]),
  );

  lines.push("");
  lines.push(csvRow(["Scorecard pillars"]));
  lines.push(csvRow(["Pillar", "Average", "Readings", "Status", "Measured by"]));
  for (const pillar of executive.pillars) {
    lines.push(
      csvRow([
        PILLAR_LABELS.en[pillar.key] ?? pillar.key,
        pillar.measured ? pillar.average : "",
        pillar.runs,
        pillar.measured
          ? pillar.key === executive.weakestPillar
            ? "Weakest measured pillar"
            : pillar.key === executive.strongestPillar
              ? "Strongest measured pillar"
              : "Measured"
          : `Not measured — needs ${pillar.sources.join(" or ")}`,
        pillar.measuredBy.join("; "),
      ]),
    );
  }

  lines.push("");
  lines.push(csvRow(["Summary by simulator"]));
  lines.push(
    csvRow([
      "Simulator",
      "Runs",
      "People",
      "Average score",
      "Max score",
      "Average percent",
      "Room profile",
      "Median time (mm:ss)",
      "Lowest run (%)",
      "Highest run (%)",
      "Weakest dimension",
      "Weakest average",
      "Strongest dimension",
      "Strongest average",
    ]),
  );

  for (const entry of simulators) {
    const weakest = entry.dimensions[0];
    const strongest = entry.dimensions[entry.dimensions.length - 1];
    const profiles = PROFILE_LABELS.en[entry.simulator];

    lines.push(
      csvRow([
        entry.simulator,
        entry.runs,
        entry.participants,
        entry.averageScore,
        entry.maxScore ?? "",
        entry.averagePercent ?? "",
        entry.bandKey ? (profiles?.[entry.bandKey] ?? entry.bandKey) : "",
        formatClock(entry.medianDurationMs),
        entry.minPercent ?? "",
        entry.maxPercent ?? "",
        weakest ? dimensionLabel(entry.simulator, weakest.key, "en") : "",
        weakest ? weakest.average : "",
        strongest ? dimensionLabel(entry.simulator, strongest.key, "en") : "",
        strongest ? strongest.average : "",
      ]),
    );
  }

  lines.push("");
  lines.push(csvRow(["Dimensions by simulator, weakest first"]));
  lines.push(
    csvRow(["Simulator", "Dimension", "Room average", "Readings", "Standing", "Lowest", "Highest", "Answered correctly"]),
  );
  for (const entry of simulators) {
    for (const dimension of entry.dimensions) {
      lines.push(
        csvRow([
          entry.simulator,
          dimensionLabel(entry.simulator, dimension.key, "en"),
          dimension.average,
          dimension.runs,
          dimension.strong ? "Strength" : "Gap",
          dimension.min,
          dimension.max,
          dimension.correctRuns === null ? "" : `${dimension.correctRuns} of ${dimension.runs}`,
        ]),
      );
    }
  }

  const withRoles = simulators.filter((entry) => entry.roles && entry.roles.length);
  if (withRoles.length) {
    lines.push("");
    lines.push(csvRow(["Ownership accuracy by accountable role, weakest first"]));
    lines.push(csvRow(["Simulator", "Accountable role", "Room average", "Answers counted", "Scenarios"]));
    for (const entry of withRoles) {
      for (const role of entry.roles ?? []) {
        lines.push(
          csvRow([
            entry.simulator,
            ROLE_LABELS.en[role.key] ?? role.key,
            role.average,
            role.answers,
            role.scenarios,
          ]),
        );
      }
    }
  }

  if (departments) {
    lines.push("");
    lines.push(csvRow(["Department ranking"]));
    lines.push(
      csvRow([
        "Rank",
        "Department",
        "People",
        "Runs",
        "Department index (0-100)",
        "Standing",
        "Simulators played",
        "Weakest pillar",
        "Strongest pillar",
        "Reading strength",
      ]),
    );
    for (const row of departments.ranking) {
      lines.push(
        csvRow([
          row.rank,
          row.department,
          row.people,
          row.runs,
          row.executive.index ?? "",
          row.executive.bandKey ? (BAND_LABELS.en[row.executive.bandKey] ?? row.executive.bandKey) : "",
          `${row.executive.simulatorsCounted} of ${row.executive.simulatorsAvailable}`,
          row.executive.weakestPillar ? (PILLAR_LABELS.en[row.executive.weakestPillar] ?? row.executive.weakestPillar) : "",
          row.executive.strongestPillar
            ? (PILLAR_LABELS.en[row.executive.strongestPillar] ?? row.executive.strongestPillar)
            : "",
          row.executive.confidence === "baseline" ? "Baseline" : "Indicative only",
        ]),
      );
    }
    for (const name of departments.notYetPlayed) lines.push(csvRow(["", name, 0, 0, "", "Not played yet"]));
    if (departments.unassignedRuns) {
      lines.push(csvRow(["", "Runs without a department (not ranked)", "", departments.unassignedRuns]));
    }

    lines.push("");
    lines.push(csvRow(["Departments by simulator"]));
    lines.push(
      csvRow([
        "Department",
        "Simulator",
        "People",
        "Average percent",
        "Profile",
        "Weakest dimension",
        "Weakest average",
        "Strongest dimension",
        "Strongest average",
      ]),
    );
    for (const row of departments.ranking) {
      for (const entry of row.simulators) {
        const weakest = entry.dimensions[0];
        const strongest = entry.dimensions[entry.dimensions.length - 1];
        const profiles = PROFILE_LABELS.en[entry.simulator];
        lines.push(
          csvRow([
            row.department,
            entry.simulator,
            entry.participants,
            entry.averagePercent ?? "",
            entry.bandKey ? (profiles?.[entry.bandKey] ?? entry.bandKey) : "",
            weakest ? dimensionLabel(entry.simulator, weakest.key, "en") : "",
            weakest ? weakest.average : "",
            strongest ? dimensionLabel(entry.simulator, strongest.key, "en") : "",
            strongest ? strongest.average : "",
          ]),
        );
      }
    }

    lines.push("");
    lines.push(csvRow(["Department pillars"]));
    lines.push(csvRow(["Department", ...PILLAR_ORDER.map((key: string) => PILLAR_LABELS.en[key] ?? key)]));
    for (const row of departments.ranking) {
      lines.push(
        csvRow([
          row.department,
          ...row.executive.pillars.map((pillar) => (pillar.measured ? pillar.average : "")),
        ]),
      );
    }
  }

  return `﻿${lines.join("\r\n")}\r\n`;
};

export default async (request: Request) => {
  const session = await resolveSession(request);

  if (!session) {
    return Response.json({ error: "Not in a space", reason: "no-seat" }, { status: 401 });
  }

  if (session.seat.role !== "sponsor") {
    return Response.json({ error: "This report is for sponsor access", reason: "not-sponsor" }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get("format") === "csv" ? "csv" : "json";

  try {
    const rows = await db
      .select({
        simulator: simulatorScores.simulator,
        name: simulatorScores.playerName,
        score: simulatorScores.score,
        extraScore: simulatorScores.extraScore,
        durationMs: simulatorScores.durationMs,
        locale: simulatorScores.locale,
        breakdown: simulatorScores.breakdown,
        sessionId: simulatorScores.workspaceSessionId,
        // The person the run was recorded against, copied onto the row at write
        // time -- the same key the one-attempt rule is enforced on, and the one
        // that survives the seat being deleted (see db/schema.ts).
        participantKey: simulatorScores.participantKey,
        department: simulatorScores.department,
        seatDepartment: workspaceSessions.department,
        // The seat's key, only as a fallback for a row written before the
        // column existed. Left, not inner: a run whose seat row was deleted is
        // still a run this room published, and dropping it would quietly
        // understate the report.
        seatParticipantKey: workspaceSessions.participantKey,
        createdAt: simulatorScores.createdAt,
      })
      .from(simulatorScores)
      .leftJoin(workspaceSessions, eq(simulatorScores.workspaceSessionId, workspaceSessions.id))
      .where(eq(simulatorScores.workspaceId, session.space.id))
      .orderBy(desc(simulatorScores.createdAt))
      .limit(MAX_ROWS + 1);

    const truncated = rows.length > MAX_ROWS;
    // The simulators this space offers right now. A simulator taken out of a
    // space after somebody played it leaves the report with it: the report
    // describes the exercise the space is running, and an index that quietly
    // averaged in a simulator nobody can open any more would not.
    const offered = spaceSimulators(session.space);
    const runs: ReportRun[] = (truncated ? rows.slice(0, MAX_ROWS) : rows)
      .filter((row) => offered.includes(row.simulator))
      .map(({ seatParticipantKey, seatDepartment, ...row }) => ({
        ...row,
        participantKey: row.participantKey ?? seatParticipantKey ?? null,
        department: row.department ?? seatDepartment ?? null,
      }));
    const analysis = buildAnalysis(runs, offered);
    const spaceDepartments = Array.isArray(session.space.departments) ? session.space.departments : [];
    const departments = spaceDepartments.length ? buildDepartments(runs, offered, spaceDepartments) : null;

    if (format === "csv") {
      return new Response(buildCsv(runs, analysis, departments), {
        headers: {
          // The BOM is what makes Excel open a UTF-8 export with the accents
          // intact instead of mangling every Portuguese and Spanish name in it.
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${session.space.slug}-simulator-results.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const seats = await db
      .select({
        id: workspaceSessions.id,
        role: workspaceSessions.role,
        label: workspaceSessions.participantLabel,
        participantKey: workspaceSessions.participantKey,
        createdAt: workspaceSessions.createdAt,
        lastSeenAt: workspaceSessions.lastSeenAt,
        revokedAt: workspaceSessions.revokedAt,
      })
      .from(workspaceSessions)
      .where(eq(workspaceSessions.workspaceId, session.space.id))
      .orderBy(desc(workspaceSessions.createdAt))
      .limit(MAX_SEATS);

    const activeSince = Date.now() - ACTIVE_WINDOW_MS;

    // Distinct people who joined, as opposed to distinct browsers that joined.
    // Both numbers are reported because they answer different questions: `total`
    // is how many times the space was entered, `people` is how big the room was.
    // A seat with no key counts as its own person, since there is nothing to say
    // it was anybody already counted.
    const people = new Set(seats.map((seat) => (seat.participantKey ? `pk:${seat.participantKey}` : `seat:${seat.id}`)));

    return Response.json(
      {
        space: publicSpace(session.space),
        truncated,
        maxRows: MAX_ROWS,
        // The two numbers the page needs to word a finding without inventing a
        // threshold of its own.
        thresholds: { strength: STRENGTH_THRESHOLD, baselineParticipants: BASELINE_PARTICIPANTS },
        seats: {
          total: seats.length,
          people: people.size,
          participants: seats.filter((seat) => seat.role === "participant").length,
          sponsors: seats.filter((seat) => seat.role === "sponsor").length,
          revoked: seats.filter((seat) => seat.revokedAt !== null).length,
          activeRecently: seats.filter((seat) => seat.lastSeenAt.getTime() >= activeSince).length,
        },
        totals: {
          runs: runs.length,
          participants: analysis.participants.size,
          simulatorsPlayed: analysis.simulators.length,
          simulatorsAvailable: offered.length,
        },
        executive: analysis.executive,
        simulators: analysis.simulators,
        // Null for a space that does not ask for departments.
        departments,
      },
      { headers: { "Cache-Control": "no-store", Vary: "Cookie" } },
    );
  } catch (error) {
    console.error("Workspace report failed", error);
    return Response.json({ error: "Unable to build the report" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/workspace/report",
  method: ["GET"],
  // One sponsor, refreshing during a session and exporting once or twice.
  rateLimit: {
    windowSize: 60,
    windowLimit: 60,
    aggregateBy: "ip",
  },
};
