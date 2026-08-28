import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workspaceScenarioText, workspaces } from "../../db/schema.js";
import {
  countFields,
  isLocale,
  isSimulator,
  loadScenarioText,
  sanitizeOverrides,
} from "../lib/scenario-text.js";

// The console behind the "Scenario wording" panel of /admin/spaces/: rewriting
// the text of a simulator for one company, and putting it back.
//
// Same Identity gate as the rest of /admin/, for the same reason given at the
// top of admin-workspaces.mts. What is different here is what a mistake costs.
// The other endpoints in this feature change who can get in; this one changes
// what a participant reads, and a private run's score is only comparable to a
// public one because this endpoint is incapable of storing anything except
// text. That guarantee is not a convention the console follows -- it is
// sanitizeOverrides(), which drops every key that is not one of the whitelisted
// wording fields, so an `impact` or an `optimalChoice` in a payload never
// reaches the database no matter what sent it.
//
// A save is a whole document per (space, simulator, language), not a field at a
// time: the editor loads the set, the operator works through it, and one PUT
// replaces it. That makes the wording a participant sees a single version rather
// than a partially applied one, which matters because the page applies overrides
// all-or-nothing for the same reason.
//
// Keep in sync with assets/js/admin-spaces.js and netlify/lib/scenario-fields.mjs.

/** What the panel needs to draw the "customised / standard" grid, without loading nine documents. */
const summaryRows = async () =>
  db
    .select({
      workspaceId: workspaceScenarioText.workspaceId,
      simulator: workspaceScenarioText.simulator,
      locale: workspaceScenarioText.locale,
      overrides: workspaceScenarioText.overrides,
      updatedAt: workspaceScenarioText.updatedAt,
    })
    .from(workspaceScenarioText);

export default async (request: Request) => {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    if (request.method === "GET") {
      const params = new URL(request.url).searchParams;
      const workspaceId = Number(params.get("workspaceId"));
      const simulator = params.get("simulator") ?? "";
      const locale = params.get("locale") ?? "";

      // No space named: the summary. One row per set that has been customised,
      // which the panel joins against its own list of spaces.
      if (!Number.isInteger(workspaceId) || workspaceId < 1) {
        const rows = await summaryRows();
        return Response.json({
          sets: rows.map((row) => ({
            workspaceId: row.workspaceId,
            simulator: row.simulator,
            locale: row.locale,
            fields: countFields(row.overrides),
            updatedAt: row.updatedAt,
          })),
        });
      }

      if (!isSimulator(simulator) || !isLocale(locale)) {
        return Response.json({ error: "Which simulator, in which language?" }, { status: 400 });
      }

      const document = await loadScenarioText(workspaceId, simulator, locale);

      // An empty document rather than a 404 when nothing has been written: the
      // editor's job in that case is to show the shipped wording with every
      // field blank, which is a set that exists and has no overrides.
      return Response.json({
        workspaceId,
        simulator,
        locale,
        overrides: document?.overrides ?? {},
        fields: countFields(document?.overrides),
        updatedAt: document?.updatedAt ?? null,
      });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const workspaceId = Number(payload.workspaceId);
    const simulator = String(payload.simulator ?? "");
    const locale = String(payload.locale ?? "");

    if (!Number.isInteger(workspaceId) || workspaceId < 1) {
      return Response.json({ error: "Which space?" }, { status: 400 });
    }
    if (!isSimulator(simulator) || !isLocale(locale)) {
      return Response.json({ error: "Which simulator, in which language?" }, { status: 400 });
    }

    // Checked rather than left to the foreign key, so a stale console tab that
    // saves into a deleted space is told what happened instead of getting a 500.
    const [space] = await db
      .select({ id: workspaces.id, slug: workspaces.slug })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));
    if (!space) return Response.json({ error: "Space not found" }, { status: 404 });

    if (request.method === "PUT") {
      const { overrides, fields, dropped, truncated } = sanitizeOverrides(simulator, locale, payload.overrides);

      if (truncated) {
        return Response.json(
          { error: "That wording is too long to store as one set. Shorten the longest passages and save again." },
          { status: 413 },
        );
      }

      // Nothing left after sanitising is the operator clearing the set, and it
      // is stored as "no row" rather than as an empty document, so a space that
      // has been reverted is indistinguishable from one that was never touched.
      if (!fields) {
        await db
          .delete(workspaceScenarioText)
          .where(
            and(
              eq(workspaceScenarioText.workspaceId, workspaceId),
              eq(workspaceScenarioText.simulator, simulator),
              eq(workspaceScenarioText.locale, locale),
            ),
          );
        return Response.json({ saved: { fields: 0, dropped, updatedAt: null }, reverted: true });
      }

      // Upsert on the unique index, so saving twice from two tabs leaves one
      // version rather than failing the second or storing both.
      const [saved] = await db
        .insert(workspaceScenarioText)
        .values({ workspaceId, simulator, locale, overrides })
        .onConflictDoUpdate({
          target: [
            workspaceScenarioText.workspaceId,
            workspaceScenarioText.simulator,
            workspaceScenarioText.locale,
          ],
          set: { overrides, updatedAt: sql`now()` },
        })
        .returning({ updatedAt: workspaceScenarioText.updatedAt });

      // `fields` and `dropped` go back so the console can report "78 fields
      // saved" and the operator can notice when that is not the number they
      // expected -- the only way a silently dropped key becomes visible.
      return Response.json({ saved: { fields, dropped, updatedAt: saved?.updatedAt ?? null } });
    }

    if (request.method === "DELETE") {
      await db
        .delete(workspaceScenarioText)
        .where(
          and(
            eq(workspaceScenarioText.workspaceId, workspaceId),
            eq(workspaceScenarioText.simulator, simulator),
            eq(workspaceScenarioText.locale, locale),
          ),
        );

      return Response.json({ reverted: { simulator, locale } });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Scenario wording administration failed", error);
    return Response.json({ error: "Unable to save that wording" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/scenario-text",
  method: ["GET", "PUT", "DELETE"],
};
