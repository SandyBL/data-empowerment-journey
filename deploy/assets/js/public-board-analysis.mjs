/**
 * The public leaderboards, summarised.
 *
 * The private facilitator report answers "where is this room weak", and it can
 * only answer it because a private run stores its per-dimension breakdown. A
 * public run does not: simulator-score-submit.mts writes `breakdown: null` for
 * anything published outside a space, on the grounds that keeping the
 * per-dimension detail of a stranger's run would be storing data for no reason.
 *
 * So this file is deliberately the smaller instrument. Everything it computes
 * comes from four columns -- simulator, score, duration, locale -- and it makes
 * no claim about dimensions or pillars, because the rows cannot support one.
 * What it can say is how the population of published runs is distributed, how
 * far apart the strongest and the weakest are, and how many people are in it.
 *
 * That last figure is why `confident` exists. A distribution over nine runs is
 * an anecdote, and a page that renders "33% of practitioners" from three rows is
 * exactly the kind of thing this site's articles tell people not to do. So the
 * sample size travels with every number and the renderer is expected to change
 * its wording rather than its arithmetic: counts below the threshold, shares
 * above it.
 *
 * Stable keys and numbers only, no sentences. Like simulator-analysis.mjs, this
 * runs in three places -- the build, a Netlify function, and the browser -- and
 * only one of them knows what language the reader chose.
 */

import { BANDS, MAX_SCORES, bandFor, percentOf } from './simulator-analysis.mjs';

/** The three simulators, in the order the page presents them. */
export const BOARD_ORDER = [
  'data-governance-day-to-day',
  'data-ownership-conflict',
  'data-literacy',
];

/**
 * Runs per board before a distribution is described as a distribution.
 *
 * Thirty is not a statistical guarantee, and it is not claimed as one. It is the
 * point at which a band histogram stops being a list of individuals: below it,
 * one person moving between bands changes every percentage on the page by double
 * digits, which makes the percentage the least informative way to state the
 * fact.
 */
export const MIN_SAMPLE = 30;

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const round = (value, places = 1) =>
  value === null || !Number.isFinite(value) ? null : Number(value.toFixed(places));

/** Counts by key, as a plain object, so the payload serialises to JSON. */
const tally = (values) => {
  const counts = {};
  for (const value of values) {
    if (!value) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
};

/**
 * One board.
 *
 * `spread` is the gap between the best and the median rather than a standard
 * deviation: on a board this size the deviation is dominated by whoever happened
 * to play, while "the best run scored N points above the middle one" is a
 * statement about the same two rows however many rows arrive later.
 */
const summarizeBoard = (simulator, rows) => {
  const percents = rows.map((row) => percentOf(simulator, row.score)).filter((value) => value !== null);
  const durations = rows
    .map((row) => Number(row.durationMs))
    .filter((value) => Number.isFinite(value) && value > 0);

  const bands = Object.fromEntries(BANDS.map((band) => [band.key, 0]));
  for (const percent of percents) {
    const key = bandFor(percent);
    if (key) bands[key] += 1;
  }

  const best = percents.length ? Math.max(...percents) : null;
  const middle = median(percents);
  const dates = rows.map((row) => row.createdAt).filter(Boolean).map((value) => new Date(value).getTime());

  return {
    simulator,
    maxScore: MAX_SCORES.get(simulator) ?? null,
    runs: rows.length,
    // Whether this board's own numbers may be stated as shares.
    confident: rows.length >= MIN_SAMPLE,
    best: round(best),
    mean: round(percents.length ? percents.reduce((total, value) => total + value, 0) / percents.length : null),
    median: round(middle),
    spread: round(best !== null && middle !== null ? best - middle : null),
    bands,
    // The two timed boards only. Day-to-Day does not time itself, so reporting a
    // median of nothing as zero would invent a fact about it.
    timedRuns: durations.length,
    medianDurationMs: durations.length ? Math.round(median(durations)) : null,
    fastestDurationMs: durations.length ? Math.min(...durations) : null,
    locales: tally(rows.map((row) => row.locale)),
    firstAt: dates.length ? new Date(Math.min(...dates)).toISOString() : null,
    lastAt: dates.length ? new Date(Math.max(...dates)).toISOString() : null,
  };
};

/**
 * Every board, plus one cross-board reading.
 *
 * The index is the mean of every run's percentage across all three simulators,
 * not the mean of the three board averages: a board with twenty runs and a board
 * with two should not carry equal weight in one number that claims to describe
 * the whole population.
 */
export const summarizePublicBoards = (rows, { generatedAt = new Date() } = {}) => {
  const known = rows.filter((row) => MAX_SCORES.has(row.simulator));
  const boards = BOARD_ORDER.map((simulator) =>
    summarizeBoard(
      simulator,
      known.filter((row) => row.simulator === simulator)
    )
  );

  const allPercents = known.map((row) => percentOf(row.simulator, row.score)).filter((value) => value !== null);
  const index = allPercents.length
    ? allPercents.reduce((total, value) => total + value, 0) / allPercents.length
    : null;

  const dates = known.map((row) => row.createdAt).filter(Boolean).map((value) => new Date(value).getTime());

  return {
    generatedAt: new Date(generatedAt).toISOString(),
    totalRuns: known.length,
    // The overall reading is gated on the same threshold, applied to the pooled
    // runs rather than to any one board: three boards of twelve is a population
    // worth describing even though no single board has reached thirty.
    confident: known.length >= MIN_SAMPLE,
    index: round(index),
    band: index === null ? null : bandFor(index),
    locales: tally(known.map((row) => row.locale)),
    firstAt: dates.length ? new Date(Math.min(...dates)).toISOString() : null,
    lastAt: dates.length ? new Date(Math.max(...dates)).toISOString() : null,
    boards,
  };
};

/** The shape the page renders when there is no snapshot and no live answer. */
export const emptySummary = () => summarizePublicBoards([]);
