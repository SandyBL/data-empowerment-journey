/**
 * The public board numbers, as the build sees them.
 *
 * /<lang>/simulator-results/ is a static page and the boards it describes are a
 * live database table, so the numbers have to arrive from somewhere at build
 * time. There are two sources and a floor:
 *
 *   1. the deployed /api/simulator-insights, fetched once per build. Every
 *      deploy therefore republishes with current figures and nobody has to
 *      remember to refresh anything;
 *   2. content/data/simulator-insights.json, the committed snapshot, used when
 *      the fetch fails or is switched off;
 *   3. an empty summary, which the page renders as "no runs yet" rather than as
 *      zeroes that look like findings.
 *
 * The fetch is wrapped in a timeout and a try/catch and can never fail a build.
 * That is the whole reason it is allowed to exist: a static site whose deploys
 * depend on its own production API being up has traded a stale number for an
 * outage, which is a bad trade. The worst case here is that a deploy publishes
 * the snapshot instead of today's figures.
 *
 * Set SKIP_INSIGHTS_FETCH=1 for an offline or reproducible build.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { emptySummary } from '../../assets/js/public-board-analysis.mjs';
import { SITE_ORIGIN } from './brand.mjs';

export const SNAPSHOT_PATH = 'content/data/simulator-insights.json';

const FETCH_TIMEOUT_MS = 6000;

/** Rejects a payload that parsed but is not a summary, before it reaches a page. */
const looksLikeSummary = (value) =>
  Boolean(
    value &&
      typeof value === 'object' &&
      Number.isFinite(value.totalRuns) &&
      Array.isArray(value.boards)
  );

const fetchLive = async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`${SITE_ORIGIN}/api/simulator-insights`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return looksLikeSummary(payload) ? payload : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const readSnapshot = async (projectDirectory) => {
  try {
    const payload = JSON.parse(await readFile(path.join(projectDirectory, SNAPSHOT_PATH), 'utf8'));
    return looksLikeSummary(payload) ? payload : null;
  } catch {
    return null;
  }
};

/**
 * Returns `{ summary, source }`, where source is one of `live`, `snapshot` or
 * `empty`. The page prints nothing about the source, but the build log does, so
 * a deploy that quietly fell back to a month-old snapshot is visible.
 */
export const loadInsightsSnapshot = async (projectDirectory) => {
  if (!process.env.SKIP_INSIGHTS_FETCH) {
    const live = await fetchLive();
    if (live) return { summary: live, source: 'live' };
  }

  const snapshot = await readSnapshot(projectDirectory);
  if (snapshot) return { summary: snapshot, source: 'snapshot' };

  return { summary: emptySummary(), source: 'empty' };
};
