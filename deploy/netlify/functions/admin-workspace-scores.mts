import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions } from "../../db/schema.js";

// Reading and deleting individual leaderboard rows, on any board.
//
// This exists because until now nothing could remove a row. A leaderboard that
// takes free text from anonymous visitors and has no delete is a leaderboard
// that will eventually be carrying somebody's abuse under a client's logo, and
// the only remedy was a hand-written SQL statement. It is also the mechanism
// behind a request a client is entitled to make — "take that person's name off
// the board" — and behind clearing a demo run out of a space before the real
// session starts.
//
// Netlify Identity guarded, like the rest of /admin/. Deletion is by explicit
// row id and never by filter: "delete everything matching this" is one typo
// away from emptying a board, and a console that lists rows and deletes the
// ones that were ticked cannot make that mistake.
//
// Keep in sync with assets/js/admin-spaces.js.

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

/** One request may remove a page of rows, not a board. */
const MAX_DELETE = 100;

export default async (request: Request) => {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    if (request.method === "GET") {
      const params = new URL(request.url).searchParams;
      const space = params.get("space") ?? "public";
      const simulator = params.get("simulator") ?? "";
      const requested = Number.parseInt(params.get("limit") ?? "", 10);
      const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : DEFAULT_LIMIT;

      // "public" is a board like any other here, and the only way to name the
      // one whose workspace_id is NULL.
      let board;
      if (space === "public") {
        board = isNull(simulatorScores.workspaceId);
      } else {
        const spaceId = Number(space);
        if (!Number.isInteger(spaceId) || spaceId < 1) {
          return Response.json({ error: "Unknown board" }, { status: 400 });
        }
        board = eq(simulatorScores.workspaceId, spaceId);
      }

      const filters = simulator ? and(board, eq(simulatorScores.simulator, simulator)) : board;

      const rows = await db
        .select({
          id: simulatorScores.id,
          simulator: simulatorScores.simulator,
          name: simulatorScores.playerName,
          score: simulatorScores.score,
          extraScore: simulatorScores.extraScore,
          durationMs: simulatorScores.durationMs,
          locale: simulatorScores.locale,
          breakdown: simulatorScores.breakdown,
          createdAt: simulatorScores.createdAt,
          // The label the seat typed at the gate, which is often the person's
          // real name where the board entry is a nickname. Only ever populated
          // for rows published inside a space.
          seatLabel: workspaceSessions.participantLabel,
          seatRole: workspaceSessions.role,
        })
        .from(simulatorScores)
        .leftJoin(workspaceSessions, eq(simulatorScores.workspaceSessionId, workspaceSessions.id))
        .where(filters)
        .orderBy(desc(simulatorScores.createdAt))
        .limit(limit);

      return Response.json({ rows, limit }, { headers: { "Cache-Control": "no-store" } });
    }

    if (request.method === "DELETE") {
      const payload = (await request.json()) as Record<string, unknown>;
      const ids = Array.isArray(payload.ids)
        ? payload.ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)
        : [];

      if (!ids.length) {
        return Response.json({ error: "Nothing selected" }, { status: 400 });
      }

      if (ids.length > MAX_DELETE) {
        return Response.json({ error: `Delete at most ${MAX_DELETE} rows at a time` }, { status: 400 });
      }

      const deleted = await db
        .delete(simulatorScores)
        .where(inArray(simulatorScores.id, ids))
        .returning({ id: simulatorScores.id });

      // Logged because it is destructive and there is no undo: the row and the
      // name on it are gone, and the only remaining record that it was a
      // deliberate act is this line.
      console.warn("Leaderboard rows deleted:", JSON.stringify({ ids: deleted.map((row) => row.id) }));

      return Response.json({ deleted: deleted.map((row) => row.id) });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Leaderboard administration failed", error);
    return Response.json({ error: "Unable to complete that change" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/workspace-scores",
  method: ["GET", "DELETE"],
};
