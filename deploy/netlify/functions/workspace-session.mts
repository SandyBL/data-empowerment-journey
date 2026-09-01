import type { Config } from "@netlify/functions";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions } from "../../db/schema.js";
import {
  clearedHintCookie,
  clearedSessionCookie,
  findSpaceBySlug,
  normalizeSlug,
  publicSpace,
  resolveSession,
  spaceClosedReason,
} from "../lib/workspace-access.js";
import { isLocale, isSimulator, loadScenarioText } from "../lib/scenario-text.js";

// "Which space is this browser in, and what may it see?"
//
// Every simulator page asks this on load, including the nine public ones, so a
// visitor with no seat is an ordinary answer and not an error: this returns 200
// with `joined: false` rather than a 401, because a 401 on every public page
// load would fill the console of a site that is working correctly.
//
// The page never decides which space it is in. It may pass a slug so the join
// screen can show the client's name and logo before anyone has typed a code,
// but the seat in the answer comes from the cookie alone — a query string is a
// request to be told about a space, never a claim to be inside one.
//
// DELETE is "leave this space". It revokes the seat rather than only dropping
// the cookie, so a shared laptop in a training room cannot be walked back into
// the space with the browser's back button.
//
// The hub passes `progress=1` and gets back which simulators this person has
// already finished -- "this person", not "this browser", which is the point. A
// room almost never plays all three in one sitting: somebody finishes one before
// lunch, the seat lapses overnight, and they come back to a browser that has
// forgotten everything. Joining through the name they typed means the hub can
// show them the two they still owe instead of three identical cards.
//
// A simulator page asks the same question once, at the end of a run, because a
// space records only each person's first attempt: the results screen has to know
// whether it is about to save one or is looking at a replay. See
// assets/js/workspace-auto-publish.js.
//
// A simulator page also passes `simulator` and `locale`, and a seated browser
// gets back the wording its company had rewritten for exactly that page. That
// rides along here rather than in an endpoint of its own for two reasons: the
// page is already making this request on load, so custom wording costs a seated
// participant no extra round trip and no extra wait before the first scenario
// renders; and a public visitor -- who is the overwhelming majority of traffic
// and never has a seat -- pays nothing at all, because the extra query only runs
// after a live seat has been resolved.

/**
 * Ceiling on the runs one progress lookup reads.
 *
 * This is one person in one space across the life of a licence, so a handful of
 * rows in practice. The cap is only here so that a space where somebody has
 * replayed a simulator two hundred times cannot turn a hub page load into a
 * large read; the roll-up below is by simulator, and the extra rows would not
 * change the answer.
 */
const MAX_PROGRESS_ROWS = 200;

/**
 * Which simulators this participant has finished, best score and last attempt.
 *
 * Matched on the participant key rather than the seat, so a run published
 * yesterday under the same name counts today. Read from the run's own key and no
 * longer joined through the seat that wrote it: that is the same key the
 * one-attempt-per-person rule is enforced on, and reading progress through a
 * second route is how a hub comes to say "not played yet" about an exercise the
 * board will refuse to record again. One identity, one answer.
 *
 * A seat that predates the key -- anything that joined before the name was
 * required -- has no identity to match on, so it falls back to its own runs: the
 * person still sees the truth about this sitting, which is exactly what they saw
 * before this existed, and it is the same fallback the write path uses.
 */
const readProgress = async (spaceId: number, seatId: number, participantKey: string | null) => {
  const runs = await db
    .select({
      simulator: simulatorScores.simulator,
      score: simulatorScores.score,
      createdAt: simulatorScores.createdAt,
    })
    .from(simulatorScores)
    .where(
      and(
        eq(simulatorScores.workspaceId, spaceId),
        participantKey
          ? eq(simulatorScores.participantKey, participantKey)
          : eq(simulatorScores.workspaceSessionId, seatId),
      ),
    )
    .limit(MAX_PROGRESS_ROWS);

  const perSimulator = new Map<string, { simulator: string; runs: number; bestScore: number; lastPlayedAt: Date }>();

  for (const run of runs) {
    const entry = perSimulator.get(run.simulator);
    if (!entry) {
      perSimulator.set(run.simulator, {
        simulator: run.simulator,
        runs: 1,
        bestScore: run.score,
        lastPlayedAt: run.createdAt,
      });
      continue;
    }
    entry.runs += 1;
    if (run.score > entry.bestScore) entry.bestScore = run.score;
    if (run.createdAt > entry.lastPlayedAt) entry.lastPlayedAt = run.createdAt;
  }

  return [...perSimulator.values()];
};

const spaceFacade = async (slug: string) => {
  const space = await findSpaceBySlug(slug);
  if (!space) return { space: null, reason: "not-found" as const };
  return { space: publicSpace(space), reason: spaceClosedReason(space) };
};

export default async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const slug = normalizeSlug(params.get("slug"));
  // Which page is asking. Validated against the three slugs and three languages
  // rather than trusted, because it selects a row.
  const simulator = params.get("simulator") ?? "";
  const locale = params.get("locale") ?? "";

  try {
    const session = await resolveSession(request);

    if (request.method === "DELETE") {
      if (session) {
        await db
          .update(workspaceSessions)
          .set({ revokedAt: new Date() })
          .where(eq(workspaceSessions.id, session.seat.id));
      }

      // Both cookies go, and the readable hint goes too: a browser that has
      // left the space must stop hiding the public header on the next simulator
      // it opens. The page-side code drops the same cookie defensively when the
      // server says there is no seat, but a browser that leaves and never opens
      // another simulator would otherwise carry a stale hint until it lapsed.
      const headers = new Headers({ "Cache-Control": "no-store" });
      headers.append("Set-Cookie", clearedSessionCookie());
      headers.append("Set-Cookie", clearedHintCookie());

      return Response.json({ joined: false }, { headers });
    }

    if (session) {
      // A seat in one space, asked about another: the honest answer is both
      // facts, so the page can offer to switch instead of silently showing the
      // wrong company's board.
      if (slug && slug !== session.space.slug) {
        const requested = await spaceFacade(slug);
        return Response.json(
          {
            joined: false,
            reason: "other-space",
            space: requested.space,
            currentSpace: publicSpace(session.space),
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      // Only when the page said which simulator it is, and only for a live
      // seat. Left out of the response entirely when this space plays the
      // shipped wording, which is the normal case: absent means "the standard
      // text", and the page can tell that apart from an empty rewrite.
      const text =
        isSimulator(simulator) && isLocale(locale)
          ? await loadScenarioText(session.space.id, simulator, locale)
          : null;

      // Only for the callers that ask: the hub on load, and a simulator page
      // once at the end of a run. Nine pages reading a participant's progress on
      // every page load would be three reads per exercise for an answer that
      // only matters at the moment a score would be written.
      const progress =
        params.get("progress") === "1"
          ? await readProgress(session.space.id, session.seat.id, session.seat.participantKey)
          : null;

      return Response.json(
        {
          joined: true,
          role: session.seat.role,
          label: session.seat.participantLabel,
          expiresAt: session.seat.expiresAt,
          space: publicSpace(session.space),
          ...(text ? { scenarioText: text.overrides } : {}),
          ...(progress ? { progress } : {}),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!slug) {
      return Response.json({ joined: false, space: null }, { headers: { "Cache-Control": "no-store" } });
    }

    const requested = await spaceFacade(slug);
    return Response.json(
      { joined: false, space: requested.space, reason: requested.reason },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    // A failure here must not break a public simulator page, which asks this on
    // every load and only needs to know that it is not in a space.
    console.error("Workspace session lookup failed", error);
    return Response.json(
      { joined: false, space: null, error: "Unable to read session" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};

export const config: Config = {
  path: "/api/workspace/session",
  method: ["GET", "DELETE"],
  // One request per page load, and a workshop room shares one address: thirty
  // people moving between the hub and three simulators is a few hundred
  // requests in a busy minute. Set well above that.
  rateLimit: {
    windowSize: 60,
    windowLimit: 600,
    aggregateBy: "ip",
  },
};
