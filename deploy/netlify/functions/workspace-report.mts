import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions } from "../../db/schema.js";
import { publicSpace, resolveSession } from "../lib/workspace-access.js";

// The facilitator report: the one thing a private space has that no amount of
// playing the public simulators can give a client.
//
// A public leaderboard answers "who won". This answers the question a Head of
// Data actually has after a workshop — where is this room weak, how many of
// them finished, and did the second attempt go better than the first — and it
// answers it from the runs their own people published, inside their own space,
// and nobody else's.
//
// Sponsor seats only. The participant code and the sponsor code are different
// codes precisely so that the room can compete on the board without every
// person in it being able to read how the room scored as a whole; a
// participant's cookie gets a 403 here even though it is a perfectly valid seat
// in the same space.
//
// Everything is aggregate except the leaderboard names the participants already
// chose to publish. There is no per-person profile in here and no way to build
// one: `?format=csv` exports exactly the rows the board already displays plus
// the run's own dimension detail, which is what a client needs to paste into
// their own follow-up plan.

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

/** The score each simulator can output, so runs can be compared as percentages. */
const MAX_SCORES = new Map([
  ["data-governance-day-to-day", 100],
  ["data-literacy", 15],
  ["data-ownership-conflict", 1000],
]);

/**
 * Maturity bands rather than quartiles.
 *
 * A histogram in four equal slices is arithmetically tidy and says nothing. The
 * boundaries below are the ones the simulators' own result screens use to tell
 * a player where they stand, so the distribution in the report reads the same
 * way as the feedback the room already received.
 */
const BANDS = [
  { key: "developing", from: 0, to: 50 },
  { key: "competent", from: 50, to: 70 },
  { key: "strong", from: 70, to: 85 },
  { key: "leading", from: 85, to: 100.01 },
];

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
        // Left, not inner: a run whose seat row was deleted is still a run this
        // room published, and dropping it would quietly understate the report.
        participantKey: workspaceSessions.participantKey,
        createdAt: simulatorScores.createdAt,
      })
      .from(simulatorScores)
      .leftJoin(workspaceSessions, eq(simulatorScores.workspaceSessionId, workspaceSessions.id))
      .where(eq(simulatorScores.workspaceId, session.space.id))
      .orderBy(desc(simulatorScores.createdAt))
      .limit(MAX_ROWS + 1);

    const truncated = rows.length > MAX_ROWS;
    const runs = truncated ? rows.slice(0, MAX_ROWS) : rows;

    if (format === "csv") {
      // One row per published run, in the order they were published. Dimensions
      // are flattened into a single readable column rather than spread across
      // one column per key: the three simulators do not share dimensions, and a
      // sparse forty-column sheet is harder to read than a short label list.
      const header = [
        "Published at",
        "Simulator",
        "Participant",
        "Score",
        "Max score",
        "Percent",
        "Duration (mm:ss)",
        "Language",
        "Dimensions",
      ];

      const lines = [header.map(csvCell).join(",")];

      for (const run of runs) {
        const maxScore = MAX_SCORES.get(run.simulator) ?? null;
        const percent = maxScore ? round((run.score / maxScore) * 100) : "";
        const duration =
          run.durationMs === null
            ? ""
            : `${Math.floor(run.durationMs / 60000)}:${String(Math.floor((run.durationMs % 60000) / 1000)).padStart(2, "0")}`;
        const dimensions = run.breakdown
          ? Object.entries(run.breakdown as Record<string, number>)
              .map(([key, value]) => `${key} ${value}%`)
              .join("; ")
          : "";

        lines.push(
          [
            run.createdAt.toISOString(),
            run.simulator,
            run.name,
            run.score,
            maxScore ?? "",
            percent,
            duration,
            run.locale,
            dimensions,
          ]
            .map(csvCell)
            .join(","),
        );
      }

      return new Response(`﻿${lines.join("\r\n")}\r\n`, {
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
        dimensions: Map<string, { total: number; runs: number }>;
        firstRunAt: Date;
        lastRunAt: Date;
      }
    >();

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
          firstRunAt: run.createdAt,
          lastRunAt: run.createdAt,
        };
        perSimulator.set(run.simulator, bucket);
      }

      bucket.runs += 1;
      // People, not seats: somebody who played this simulator twice across two
      // sittings is one participant here, which is what a facilitator counting
      // heads in the room expects to read.
      bucket.participants.add(runIdentity(run));
      bucket.scores.push(run.score);
      if (run.durationMs !== null) bucket.durations.push(run.durationMs);
      if (run.createdAt < bucket.firstRunAt) bucket.firstRunAt = run.createdAt;
      if (run.createdAt > bucket.lastRunAt) bucket.lastRunAt = run.createdAt;

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
          const dimension = bucket.dimensions.get(key) ?? { total: 0, runs: 0 };
          dimension.total += percentage;
          dimension.runs += 1;
          bucket.dimensions.set(key, dimension);
        }
      }
    }

    const simulators = [...perSimulator.values()]
      .map((bucket) => ({
        simulator: bucket.simulator,
        runs: bucket.runs,
        participants: bucket.participants.size,
        maxScore: MAX_SCORES.get(bucket.simulator) ?? null,
        averageScore: round(bucket.scores.reduce((sum, score) => sum + score, 0) / bucket.runs),
        bestScore: Math.max(...bucket.scores),
        averagePercent: bucket.percents.length
          ? round(bucket.percents.reduce((sum, percent) => sum + percent, 0) / bucket.percents.length)
          : null,
        medianDurationMs: median(bucket.durations),
        bands: BANDS.map((band) => ({ ...band, count: bucket.bands.get(band.key) ?? 0 })),
        // Weakest first. This ordering is the report's actual recommendation:
        // the top entry is the dimension a follow-up session should open with.
        dimensions: [...bucket.dimensions.entries()]
          .map(([key, dimension]) => ({
            key,
            average: round(dimension.total / dimension.runs),
            runs: dimension.runs,
          }))
          .sort((a, b) => a.average - b.average),
        firstRunAt: bucket.firstRunAt,
        lastRunAt: bucket.lastRunAt,
      }))
      .sort((a, b) => b.runs - a.runs);

    const participants = new Set(runs.map(runIdentity));

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
          participants: participants.size,
          simulatorsPlayed: simulators.length,
        },
        simulators,
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
