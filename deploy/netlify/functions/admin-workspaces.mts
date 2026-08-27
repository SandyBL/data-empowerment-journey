import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { simulatorScores, workspaceSessions, workspaces } from "../../db/schema.js";
import {
  cleanAccent,
  cleanLine,
  cleanLogoUrl,
  generateCode,
  LOCALES,
  normalizeCode,
  normalizeSlug,
  sha256Hex,
  spaceClosedReason,
} from "../lib/workspace-access.js";

// The console behind /admin/spaces/: creating a private space, changing what it
// looks like, and ending access to it.
//
// Guarded by Netlify Identity and nothing more, which is the same bar the
// Confession Wall moderation and the Blog Content Studio clear, so a signed-in
// editor is never turned away from one tool while holding the keys to another.
// Access is controlled by who is invited into Identity, so keep registration set
// to "Invite only".
//
// Access codes are shown exactly once, on the response that creates or
// regenerates them, because only their SHA-256 is stored. That is a deliberate
// trade against the convenience of being able to look a code up later: a table
// of live codes in plaintext is the one thing in this feature whose leak would
// open every client's space at once, and "regenerate and re-send" is a ten
// second job. Regenerating also revokes the seats that code opened, so a code
// change actually ends the access it replaces instead of only affecting the next
// person to join.
//
// Keep in sync with assets/js/admin-spaces.js.

const MAX_COMPANY_LENGTH = 120;
const MAX_DISPLAY_NAME_LENGTH = 120;

/** Default licence when none is given: a quarter, which is the usual engagement. */
const DEFAULT_LICENCE_DAYS = 90;

/**
 * A date from the console, or null.
 *
 * Bounded on both sides because these two timestamps are the licence: a typo
 * that lands in 1970 opens a space that is permanently expired, and one that
 * lands in 9999 sells access that outlives the company.
 */
const parseDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  return year >= 2020 && year <= 2100 ? parsed : null;
};

/** The branding and licence fields, shared by create and update. */
const readEditableFields = (payload: Record<string, unknown>) => ({
  company: cleanLine(payload.company, MAX_COMPANY_LENGTH),
  displayName: cleanLine(payload.displayName, MAX_DISPLAY_NAME_LENGTH),
  locale: LOCALES.includes(String(payload.locale ?? "") as (typeof LOCALES)[number])
    ? String(payload.locale)
    : "en",
  logoUrl: cleanLogoUrl(payload.logoUrl),
  accentColor: cleanAccent(payload.accentColor),
  startsAt: parseDate(payload.startsAt),
  expiresAt: parseDate(payload.expiresAt),
});

/** What the console shows for a space. Never a hash, never a code. */
const spaceView = (space: typeof workspaces.$inferSelect) => ({
  id: space.id,
  slug: space.slug,
  company: space.company,
  displayName: space.displayName,
  status: space.status,
  locale: space.locale,
  logoUrl: space.logoUrl,
  accentColor: space.accentColor,
  startsAt: space.startsAt,
  expiresAt: space.expiresAt,
  createdAt: space.createdAt,
  hasSponsorCode: space.sponsorCodeHash !== null,
  closedReason: spaceClosedReason(space),
});

export default async (request: Request) => {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    if (request.method === "GET") {
      const spaces = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));

      // Two grouped queries rather than a correlated subquery per space, and
      // rather than counting in the browser: the console shows "12 runs, 5
      // seats" per space, which is two aggregates over indexed columns.
      const [runCounts, seatCounts] = await Promise.all([
        db
          .select({ workspaceId: simulatorScores.workspaceId, runs: count() })
          .from(simulatorScores)
          .groupBy(simulatorScores.workspaceId),
        db
          .select({ workspaceId: workspaceSessions.workspaceId, seats: count() })
          .from(workspaceSessions)
          .groupBy(workspaceSessions.workspaceId),
      ]);

      const runsBySpace = new Map(runCounts.map((row) => [row.workspaceId, Number(row.runs)]));
      const seatsBySpace = new Map(seatCounts.map((row) => [row.workspaceId, Number(row.seats)]));

      return Response.json({
        spaces: spaces.map((space) => ({
          ...spaceView(space),
          runs: runsBySpace.get(space.id) ?? 0,
          seats: seatsBySpace.get(space.id) ?? 0,
        })),
        // The public board's row count, so the console can offer the same
        // moderation reach over it that it has over a private one.
        publicRuns: runsBySpace.get(null) ?? 0,
      });
    }

    const payload = (await request.json()) as Record<string, unknown>;

    if (request.method === "POST") {
      const fields = readEditableFields(payload);
      const slug = normalizeSlug(payload.slug ?? fields.company);
      const wantsSponsorCode = payload.sponsorAccess !== false;

      if (!slug) return Response.json({ error: "A space needs a URL slug" }, { status: 400 });
      if (!fields.company) return Response.json({ error: "A space needs a company name" }, { status: 400 });

      const startsAt = fields.startsAt ?? new Date();
      const expiresAt =
        fields.expiresAt ?? new Date(startsAt.getTime() + DEFAULT_LICENCE_DAYS * 24 * 60 * 60 * 1000);

      if (expiresAt.getTime() <= startsAt.getTime()) {
        return Response.json({ error: "Access must end after it starts" }, { status: 400 });
      }

      const [existing] = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.slug, slug));
      if (existing) {
        return Response.json({ error: `The slug "${slug}" is already taken` }, { status: 409 });
      }

      const accessCode = generateCode();
      const sponsorCode = wantsSponsorCode ? generateCode() : null;

      const [created] = await db
        .insert(workspaces)
        .values({
          slug,
          company: fields.company,
          displayName: fields.displayName || fields.company,
          accessCodeHash: await sha256Hex(normalizeCode(accessCode)),
          sponsorCodeHash: sponsorCode ? await sha256Hex(normalizeCode(sponsorCode)) : null,
          locale: fields.locale,
          logoUrl: fields.logoUrl,
          accentColor: fields.accentColor,
          startsAt,
          expiresAt,
        })
        .returning();

      // The only response in this feature that carries codes in the clear.
      return Response.json(
        { space: { ...spaceView(created), runs: 0, seats: 0 }, codes: { accessCode, sponsorCode } },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (request.method === "PATCH") {
      const id = Number(payload.id);
      const action = cleanLine(payload.action, 40);

      if (!Number.isInteger(id) || id < 1) {
        return Response.json({ error: "Which space?" }, { status: 400 });
      }

      const [space] = await db.select().from(workspaces).where(eq(workspaces.id, id));
      if (!space) return Response.json({ error: "Space not found" }, { status: 404 });

      if (action === "update") {
        const fields = readEditableFields(payload);
        const startsAt = fields.startsAt ?? space.startsAt;
        const expiresAt = fields.expiresAt ?? space.expiresAt;

        if (expiresAt.getTime() <= startsAt.getTime()) {
          return Response.json({ error: "Access must end after it starts" }, { status: 400 });
        }

        const [updated] = await db
          .update(workspaces)
          .set({
            company: fields.company || space.company,
            displayName: fields.displayName || space.displayName,
            locale: fields.locale,
            // Cleared deliberately when the field is emptied: branding has to be
            // removable, and an unset logo that survives a save would be a
            // client's mark still on a page after they asked for it to go.
            logoUrl: fields.logoUrl,
            accentColor: fields.accentColor,
            startsAt,
            expiresAt,
          })
          .where(eq(workspaces.id, id))
          .returning();

        return Response.json({ space: spaceView(updated) });
      }

      if (action === "suspend" || action === "activate") {
        const [updated] = await db
          .update(workspaces)
          .set({ status: action === "suspend" ? "suspended" : "active" })
          .where(eq(workspaces.id, id))
          .returning();

        // Suspending also ends the seats that are already open. Without this the
        // switch would only stop new joins, and the room that is already inside
        // would keep playing until their cookies lapsed.
        let revoked = 0;
        if (action === "suspend") {
          const rows = await db
            .update(workspaceSessions)
            .set({ revokedAt: new Date() })
            .where(eq(workspaceSessions.workspaceId, id))
            .returning({ id: workspaceSessions.id });
          revoked = rows.length;
        }

        return Response.json({ space: spaceView(updated), revoked });
      }

      if (action === "regenerate-code" || action === "regenerate-sponsor-code") {
        const sponsor = action === "regenerate-sponsor-code";
        const code = generateCode();
        const hash = await sha256Hex(normalizeCode(code));

        await db
          .update(workspaces)
          .set(sponsor ? { sponsorCodeHash: hash } : { accessCodeHash: hash })
          .where(eq(workspaces.id, id));

        // Only the seats the replaced code opened, matched on role in the
        // statement itself. Regenerating the sponsor code must not throw a room
        // of participants out mid-exercise, and regenerating the participant
        // code must not close the report the sponsor is reading.
        const revoked = await db
          .update(workspaceSessions)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(workspaceSessions.workspaceId, id),
              eq(workspaceSessions.role, sponsor ? "sponsor" : "participant"),
            ),
          )
          .returning({ id: workspaceSessions.id });

        return Response.json({
          codes: sponsor ? { sponsorCode: code } : { accessCode: code },
          revoked: revoked.length,
        });
      }

      if (action === "revoke-sponsor-code") {
        await db.update(workspaces).set({ sponsorCodeHash: null }).where(eq(workspaces.id, id));
        return Response.json({ space: spaceView({ ...space, sponsorCodeHash: null }) });
      }

      if (action === "revoke-seats") {
        const rows = await db
          .update(workspaceSessions)
          .set({ revokedAt: new Date() })
          .where(eq(workspaceSessions.workspaceId, id))
          .returning({ id: workspaceSessions.id });

        return Response.json({ revoked: rows.length });
      }

      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    if (request.method === "DELETE") {
      const id = Number(payload.id);
      const confirm = normalizeSlug(payload.confirm);

      if (!Number.isInteger(id) || id < 1) {
        return Response.json({ error: "Which space?" }, { status: 400 });
      }

      const [space] = await db.select().from(workspaces).where(eq(workspaces.id, id));
      if (!space) return Response.json({ error: "Space not found" }, { status: 404 });

      // Typing the slug back is the guard. Deleting a space takes its
      // leaderboard with it through the foreign key, which is the correct
      // behaviour when a client asks for their data to be removed and an
      // expensive accident otherwise.
      if (confirm !== space.slug) {
        return Response.json({ error: "Type the space slug to confirm deletion" }, { status: 400 });
      }

      const [{ runs }] = await db
        .select({ runs: count() })
        .from(simulatorScores)
        .where(eq(simulatorScores.workspaceId, id));

      await db.delete(workspaces).where(eq(workspaces.id, id));

      return Response.json({ deleted: { slug: space.slug, runs: Number(runs) } });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Workspace administration failed", error);
    return Response.json({ error: "Unable to complete that change" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/workspaces",
  method: ["GET", "POST", "PATCH", "DELETE"],
};
