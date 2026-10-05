import type { Config } from "@netlify/functions";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores } from "../../db/schema.js";
import { resolveSession, spaceSimulators } from "../lib/workspace-access.js";
import { MAX_SCORES } from "../../assets/js/simulator-analysis.mjs";

// The department ranking a space's hub shows, for a space that asks for
// departments.
//
// Any seat in the space may read it, participant or sponsor, because it is the
// department equivalent of the leaderboard: a room competing by team needs to
// see the table. It is aggregate only -- department, how many people, the
// average per simulator and one index -- and the full department analysis, with
// pillars, dimensions and recommendations, stays in the sponsor report.
//
// The index is computed exactly as the report computes a department's: the mean
// of the department's per-simulator average percentages, each simulator counted
// once however many people played it. Two pages showing two different numbers
// for the same department would be worse than either alone.

/** Same ceiling as the report, for the same reason. */
const MAX_ROWS = 5000;

const round = (value: number) => Math.round(value * 10) / 10;

export default async (request: Request) => {
  const session = await resolveSession(request);

  if (!session) {
    return Response.json({ error: "Not in a space", reason: "no-seat" }, { status: 401 });
  }

  const departments = Array.isArray(session.space.departments) ? session.space.departments : [];
  if (!departments.length) {
    return Response.json({ departments: null }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const offered = spaceSimulators(session.space);
    const rows = await db
      .select({
        simulator: simulatorScores.simulator,
        score: simulatorScores.score,
        department: simulatorScores.department,
        participantKey: simulatorScores.participantKey,
        sessionId: simulatorScores.workspaceSessionId,
        name: simulatorScores.playerName,
      })
      .from(simulatorScores)
      .where(and(eq(simulatorScores.workspaceId, session.space.id), isNotNull(simulatorScores.department)))
      .limit(MAX_ROWS);

    type Bucket = { people: Set<string>; perSimulator: Map<string, { total: number; runs: number; people: Set<string> }> };
    const buckets = new Map<string, Bucket>(
      departments.map((name) => [name, { people: new Set(), perSimulator: new Map() }]),
    );

    for (const row of rows) {
      const bucket = row.department ? buckets.get(row.department) : undefined;
      const maxScore = MAX_SCORES.get(row.simulator);
      if (!bucket || !maxScore || !offered.includes(row.simulator)) continue;

      const identity = row.participantKey
        ? `pk:${row.participantKey}`
        : row.sessionId !== null
          ? `seat:${row.sessionId}`
          : `name:${row.name}`;
      bucket.people.add(identity);

      const entry = bucket.perSimulator.get(row.simulator) ?? { total: 0, runs: 0, people: new Set<string>() };
      entry.total += Math.min(100, Math.max(0, (row.score / maxScore) * 100));
      entry.runs += 1;
      entry.people.add(identity);
      bucket.perSimulator.set(row.simulator, entry);
    }

    const ranking = [...buckets.entries()]
      .map(([department, bucket]) => {
        const perSimulator = offered
          .filter((slug) => bucket.perSimulator.has(slug))
          .map((slug) => {
            const entry = bucket.perSimulator.get(slug)!;
            return { simulator: slug, averagePercent: round(entry.total / entry.runs), people: entry.people.size };
          });
        const index = perSimulator.length
          ? round(perSimulator.reduce((sum, entry) => sum + entry.averagePercent, 0) / perSimulator.length)
          : null;
        return { department, people: bucket.people.size, index, simulatorsCounted: perSimulator.length, perSimulator };
      })
      .sort(
        (a, b) =>
          (b.index ?? -1) - (a.index ?? -1) ||
          b.people - a.people ||
          departments.indexOf(a.department) - departments.indexOf(b.department),
      );

    return Response.json(
      { departments: ranking, simulatorsAvailable: offered.length },
      { headers: { "Cache-Control": "no-store", Vary: "Cookie" } },
    );
  } catch (error) {
    console.error("Department ranking failed", error);
    return Response.json({ error: "Unable to build the ranking" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/workspace/departments",
  method: ["GET"],
  rateLimit: {
    windowSize: 60,
    windowLimit: 600,
    aggregateBy: "ip",
  },
};
