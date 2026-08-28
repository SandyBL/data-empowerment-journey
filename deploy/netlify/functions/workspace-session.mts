import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workspaceSessions } from "../../db/schema.js";
import {
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
// A simulator page also passes `simulator` and `locale`, and a seated browser
// gets back the wording its company had rewritten for exactly that page. That
// rides along here rather than in an endpoint of its own for two reasons: the
// page is already making this request on load, so custom wording costs a seated
// participant no extra round trip and no extra wait before the first scenario
// renders; and a public visitor -- who is the overwhelming majority of traffic
// and never has a seat -- pays nothing at all, because the extra query only runs
// after a live seat has been resolved.

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

      return Response.json(
        { joined: false },
        { headers: { "Set-Cookie": clearedSessionCookie(), "Cache-Control": "no-store" } },
      );
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

      return Response.json(
        {
          joined: true,
          role: session.seat.role,
          label: session.seat.participantLabel,
          expiresAt: session.seat.expiresAt,
          space: publicSpace(session.space),
          ...(text ? { scenarioText: text.overrides } : {}),
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
