import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workspaceScenarioText } from "../../db/schema.js";
import {
  SCENARIO_LOCALES,
  SCENARIO_SIMULATORS,
  fieldSpec,
  // Plain .mjs, imported by a function and by a build script alike. See the file
  // itself for why the whitelist lives outside TypeScript.
} from "./scenario-fields.mjs";

/**
 * The gate every per-company scenario rewrite passes through on its way in.
 *
 * The admin console is behind Netlify Identity and has exactly one operator, so
 * this is not defending the database from a stranger. It is defending the
 * *feature* from a typo: the whole promise of text-only overrides is that a
 * private run scores identically to a public one, and the only thing standing
 * between that promise and a payload carrying `impact` or `optimalChoice` is
 * this function. Anything not on the whitelist is dropped silently rather than
 * rejected, because a save that failed wholesale over one stray key would lose
 * twenty minutes of an operator's typing.
 *
 * Two sanitising rules, both about how the pages render these strings:
 *
 *   * `html: true` fields (Data Literacy's scenario text and its lessons, which
 *     the page injects with innerHTML and whose shipped copy opens with
 *     <strong>) keep a five-tag subset and lose every attribute, so no href, no
 *     src and no on* survives.
 *   * Every other field is plain text, and has its angle brackets removed
 *     entirely rather than escaped. Removed because three of the pages
 *     interpolate these strings into template literals and one "<" there breaks
 *     the markup around it; not escaped because the other renderers use
 *     innerText, where "&lt;" would be shown to a participant literally.
 *
 * Keep in sync with the mirror of these rules in assets/js/scenario-text.js,
 * which applies what this stores.
 */

/** Tags an HTML field may keep. Emphasis and a line break, nothing that links or loads. */
const ALLOWED_TAGS = new Set(["strong", "b", "em", "i", "u", "br"]);

/**
 * Serialised size of one saved document.
 *
 * A backstop rather than an editing limit, and sized so that an operator working
 * normally can never meet it. The shipped wording of the largest set is about
 * 17 kB; a rewrite with every single field pushed to its own character limit --
 * four times longer than the original, everywhere -- comes to about 71 kB. This
 * clears that, so the refusal below is reachable only by something that is not a
 * person typing.
 *
 * There is a cap at all because the document is delivered to a seated
 * participant inside the session response they already fetch, so it is about
 * that response staying a sensible size rather than about storage.
 */
const MAX_DOCUMENT_CHARS = 90_000;

/** A scenario can be identified by a small positive integer and nothing else. */
const MAX_SCENARIO_ID = 60;

/** Control characters, which no editor means to type and every renderer mishandles. */
const stripControl = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

/** Collapses the whitespace a paste from a document brings with it. */
const tidy = (value: string) =>
  stripControl(value).replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();

/**
 * One HTML field, reduced to emphasis.
 *
 * Written as "drop every tag that is not on the list, and strip the attributes
 * off the ones that are" rather than as a parser: the input is a sentence with a
 * <strong> in it, and a five-tag allowlist applied to the tag name alone cannot
 * be talked into keeping an event handler.
 */
const sanitizeHtml = (value: string) =>
  tidy(value).replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, rawName: string) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (name === "br") return "<br>";
    return match.startsWith("</") ? `</${name}>` : `<${name}>`;
  });

/** One plain-text field. Angle brackets go; see the note at the top of the file. */
const sanitizeText = (value: string) => tidy(value).replace(/[<>]/g, "");

export const isSimulator = (value: unknown): value is string =>
  typeof value === "string" && SCENARIO_SIMULATORS.includes(value);

export const isLocale = (value: unknown): value is string =>
  typeof value === "string" && SCENARIO_LOCALES.includes(value);

export type ScenarioOverrides = Record<string, Record<string, string>>;

/**
 * The document as it will be stored, plus what was thrown away.
 *
 * The counts are reported back to the console so a save can say "78 fields
 * saved" and an operator can notice when that number is not the one they
 * expected -- which is the only way a silently dropped key becomes visible.
 *
 * Takes the language as well as the simulator because three of the nine pages
 * hold their scenarios in a different shape from their English original; see
 * SCENARIO_FIELD_VARIANTS in scenario-fields.mjs. A path that is editable on the
 * English Data Governance page is not necessarily editable on the Portuguese
 * one, and this is where that distinction is enforced rather than trusted.
 */
export const sanitizeOverrides = (simulator: string, locale: string, payload: unknown) => {
  const overrides: ScenarioOverrides = {};
  let fields = 0;
  let dropped = 0;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { overrides, fields, dropped, truncated: false };
  }

  for (const [rawId, rawFields] of Object.entries(payload as Record<string, unknown>)) {
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1 || id > MAX_SCENARIO_ID) {
      dropped += 1;
      continue;
    }
    if (!rawFields || typeof rawFields !== "object" || Array.isArray(rawFields)) {
      dropped += 1;
      continue;
    }

    const cleaned: Record<string, string> = {};

    for (const [path, rawValue] of Object.entries(rawFields as Record<string, unknown>)) {
      const spec = fieldSpec(simulator, locale, path);
      if (!spec || typeof rawValue !== "string") {
        dropped += 1;
        continue;
      }

      const value = (spec.html ? sanitizeHtml(rawValue) : sanitizeText(rawValue)).slice(0, spec.max);
      // An emptied field is not an override of "nothing": it is the operator
      // taking their rewrite back, and the standard wording returning.
      if (!value) continue;

      cleaned[path] = value;
      fields += 1;
    }

    if (Object.keys(cleaned).length) overrides[String(id)] = cleaned;
  }

  // Refusing the save outright would be worse than trimming it, but silently
  // storing half of somebody's afternoon would be worse still, so the caller is
  // told and says so on screen.
  const truncated = JSON.stringify(overrides).length > MAX_DOCUMENT_CHARS;

  return { overrides, fields, dropped, truncated };
};

/**
 * The wording one space plays, or null for the shipped text.
 *
 * Null rather than an empty object on purpose: "no row" is the common case by a
 * wide margin, and the caller leaves the field out of its response entirely so a
 * page can tell "this space has no rewrite" from "this space has a rewrite that
 * happens to be empty".
 */
export const loadScenarioText = async (workspaceId: number, simulator: string, locale: string) => {
  if (!isSimulator(simulator) || !isLocale(locale)) return null;

  const [row] = await db
    .select({ overrides: workspaceScenarioText.overrides, updatedAt: workspaceScenarioText.updatedAt })
    .from(workspaceScenarioText)
    .where(
      and(
        eq(workspaceScenarioText.workspaceId, workspaceId),
        eq(workspaceScenarioText.simulator, simulator),
        eq(workspaceScenarioText.locale, locale),
      ),
    )
    .limit(1);

  if (!row || !row.overrides || typeof row.overrides !== "object") return null;
  return { overrides: row.overrides as ScenarioOverrides, updatedAt: row.updatedAt };
};

/** How many fields a stored document carries. Used by the console's summary. */
export const countFields = (overrides: unknown) => {
  if (!overrides || typeof overrides !== "object") return 0;
  return Object.values(overrides as ScenarioOverrides).reduce(
    (total, fields) => total + (fields && typeof fields === "object" ? Object.keys(fields).length : 0),
    0,
  );
};
