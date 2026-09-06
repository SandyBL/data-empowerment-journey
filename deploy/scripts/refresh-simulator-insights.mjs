#!/usr/bin/env node
/**
 * Refreshes content/data/simulator-insights.json, the committed fallback the
 * build uses when the live API cannot be reached.
 *
 * Run it whenever you want the numbers baked into the repository to be current:
 *
 *   npm run refresh:insights
 *
 * It is not part of `npm run build`. The build fetches the live endpoint itself
 * and only reads this file when that fails, so refreshing is about improving the
 * fallback rather than about publishing -- which keeps a git-visible data file
 * from changing on every deploy.
 *
 * Two sources, in order of preference:
 *
 *   * /api/simulator-insights, which aggregates the whole public pool;
 *   * /api/simulator-scores, the per-simulator leaderboard, which is capped at
 *     25 rows per board. Only used when the first is unavailable -- on a board
 *     past 25 runs it undercounts, so the snapshot records that it was capped
 *     rather than presenting a partial read as a complete one.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BOARD_ORDER, summarizePublicBoards } from '../assets/js/public-board-analysis.mjs';
import { SITE_ORIGIN } from './lib/brand.mjs';
import { SNAPSHOT_PATH } from './lib/insights-snapshot.mjs';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.env.INSIGHTS_ORIGIN || SITE_ORIGIN;

const getJson = async (url) => {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
};

/** The whole-pool aggregate, when the endpoint exists. */
const fromInsights = async () => {
  const payload = await getJson(`${origin}/api/simulator-insights`);
  if (!Number.isFinite(payload?.totalRuns) || !Array.isArray(payload?.boards)) {
    throw new Error('unrecognised payload');
  }
  return { ...payload, source: 'insights' };
};

/**
 * The leaderboards, re-aggregated locally through the same module the endpoint
 * uses, so a snapshot built this way is arithmetically identical to one built
 * the other way for any board under the cap.
 */
const fromLeaderboards = async () => {
  const rows = [];
  let capped = false;

  for (const simulator of BOARD_ORDER) {
    const payload = await getJson(`${origin}/api/simulator-scores?simulator=${simulator}&limit=25`);
    const scores = Array.isArray(payload?.scores) ? payload.scores : [];
    if (scores.length >= 25) capped = true;
    for (const score of scores) rows.push({ ...score, simulator });
  }

  return { ...summarizePublicBoards(rows), source: 'leaderboard', capped };
};

const main = async () => {
  let snapshot;
  try {
    snapshot = await fromInsights();
  } catch (error) {
    process.stderr.write(`  /api/simulator-insights unavailable (${error.message}); using the leaderboards\n`);
    snapshot = await fromLeaderboards();
  }

  const file = path.join(projectDirectory, SNAPSHOT_PATH);
  await writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  const boards = snapshot.boards.map((board) => `${board.simulator}=${board.runs}`).join(' ');
  process.stdout.write(
    `Wrote ${SNAPSHOT_PATH} from ${snapshot.source}: ${snapshot.totalRuns} runs (${boards})` +
      `${snapshot.capped ? ' — capped at 25 rows per board' : ''}\n`
  );
};

await main();
