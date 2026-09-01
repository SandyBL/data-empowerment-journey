import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workspaceSessions, workspaces } from "../../db/schema.js";
import { spaceTheme } from "./workspace-brand.js";

/**
 * Everything the private-space endpoints agree on.
 *
 * A space is only as private as the weakest of the functions that read it, so
 * the rules that decide "is this browser allowed in this space, right now" live
 * here once rather than in each of them. Every entry point resolves a request
 * through `resolveSession` and gets back either a live seat or null; none of
 * them interpret a cookie, a code or an expiry on their own.
 *
 * Deliberately no signing secret. Session tokens are 32 random bytes stored as
 * SHA-256, so this module needs no environment variable to work, a stolen
 * database dump grants nobody a seat, and revoking access is an UPDATE that
 * takes effect on the very next request instead of a wait for a token to age
 * out. The cost is one indexed lookup per request, which every one of these
 * endpoints was already paying to check the licence window.
 */

/** Name of the cookie that carries a seat. Shared with assets/js/workspace-context.js. */
export const SPACE_COOKIE = "dgj_space";

/**
 * Name of the companion cookie that says "this browser is probably in a space".
 *
 * The seat cookie is HttpOnly, which is right, and it means a simulator page
 * cannot know it is being opened from inside a private space until the answer
 * comes back from /api/workspace/session -- one round trip after the public
 * header, breadcrumb and Data Governance Journey footer have already painted.
 * For a client whose whole point is seeing their own logo, that flash is the
 * defect.
 *
 * So this cookie exists purely so the inline snippet in each simulator's <head>
 * can hide the public chrome synchronously, before the first paint. It holds the
 * literal string "1" and nothing else: no token, no space slug, no name. It
 * grants nothing, proves nothing, and if it is stale or forged the only
 * consequence is that a page hides its own header for one round trip and then
 * puts it back when the server says there is no seat. Readable by script by
 * design -- that is the entire feature.
 */
export const SPACE_HINT_COOKIE = "dgj_space_hint";

/** The three boards. Kept here so every workspace endpoint validates the same set. */
export const SIMULATOR_SLUGS = [
  "data-governance-day-to-day",
  "data-literacy",
  "data-ownership-conflict",
] as const;

export const LOCALES = ["en", "es", "pt"] as const;

/** A seat cannot outlive its space, and inside that it lasts a working day. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Codes people read off a slide and type on a phone.
 *
 * Base32 without the letters and digits that get misread aloud or in a sans
 * serif face: no I, L, O, U, 0 or 1. Twelve characters out of this alphabet is
 * about 55 bits, which is far past guessable for an endpoint that rate limits
 * attempts, and short enough to fit on one line of a slide in three groups.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const CODE_LENGTH = 12;

export type SpaceRow = typeof workspaces.$inferSelect;
export type SeatRow = typeof workspaceSessions.$inferSelect;

/** SHA-256, hex. Used for both access codes and session tokens. */
export const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

/**
 * What a typed code becomes before it is hashed or compared.
 *
 * Somebody reading a code off a slide types spaces, dashes and lowercase, and
 * every one of those is the same code. Normalising on both sides means the
 * stored hash is of the canonical form and a participant never fails on
 * punctuation they were never given.
 */
export const normalizeCode = (value: unknown) =>
  typeof value === "string" ? value.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";

/** A fresh access code, grouped for reading aloud. */
export const generateCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  const raw = [...bytes].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
};

/** An opaque session token. Only its hash is ever stored. */
export const generateSessionToken = () =>
  [...crypto.getRandomValues(new Uint8Array(32))].map((byte) => byte.toString(16).padStart(2, "0")).join("");

/**
 * A URL-safe slug, or "" when nothing usable is left.
 *
 * This is the address of the space, so it is deliberately narrow: lowercase,
 * digits and single dashes. Anything else is dropped rather than escaped,
 * because a slug that needs escaping is a slug somebody will mistype.
 */
export const normalizeSlug = (value: unknown) =>
  typeof value === "string"
    ? value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)
    : "";

/**
 * One line of free text, control characters and angle brackets removed.
 *
 * Same rule as the leaderboard display names in simulator-score-submit.mts, and
 * for the same reason: these strings are rendered by several different pages,
 * and a value that cannot carry markup in the first place is safe in all of them
 * regardless of how carefully any one of them escapes.
 */
export const cleanLine = (value: unknown, maxLength: number) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f<>]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, maxLength)
    : "";

/** A `#rrggbb` accent, or null. Anything else is not applied rather than repaired. */
export const cleanAccent = (value: unknown) => {
  const accent = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(accent) ? accent.toLowerCase() : null;
};

/**
 * An https:// logo URL, or null.
 *
 * http:// is refused rather than upgraded: the pages that render this are served
 * over HTTPS with a strict policy, so a mixed-content image would simply not
 * appear, and silently rewriting somebody's URL hides the reason.
 */
export const cleanLogoUrl = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && raw.length <= 300 ? url.toString() : null;
  } catch {
    return null;
  }
};

/** Reads one cookie out of a request. */
export const readCookie = (request: Request, name: string) => {
  const header = request.headers.get("cookie");
  if (!header) return "";
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return "";
};

/**
 * The Set-Cookie value for a seat.
 *
 * HttpOnly because no script has any reason to read it and every reason not to
 * be able to: the page learns which space it is in from /api/workspace/session,
 * which is a statement from the server rather than a claim from the browser.
 * SameSite=Lax so following a link from an email into the space still arrives
 * signed in, while a cross-site POST cannot publish a score on somebody's
 * behalf. Max-Age is the licence, not a fixed period, so a seat cannot outlive
 * the access that was sold.
 */
export const sessionCookie = (token: string, expiresAt: Date) => {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return `${SPACE_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
};

/** The Set-Cookie value that ends a seat in the browser. */
export const clearedSessionCookie = () =>
  `${SPACE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

/**
 * The Set-Cookie value for the pre-paint hint. Deliberately not HttpOnly.
 *
 * Set with the same lifetime as the seat so it lapses together with the thing it
 * hints at, rather than leaving a browser hiding public chrome for a space it
 * left months ago.
 */
export const hintCookie = (expiresAt: Date) => {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return `${SPACE_HINT_COOKIE}=1; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;
};

/** The Set-Cookie value that drops the pre-paint hint. */
export const clearedHintCookie = () =>
  `${SPACE_HINT_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;

/**
 * The name somebody typed, folded down to the identity it stands for.
 *
 * Case and spacing are noise: "Ana Silva", "ana silva" and " Ana  Silva " are
 * one person coming back, and a room reading names off a leaderboard will type
 * all three across two mornings. Accents are folded for the same reason, because
 * "Joao" on a laptop keyboard and "João" on a phone are the same participant and
 * treating them as strangers would silently lose their finished runs.
 *
 * Punctuation is stripped rather than kept so that trailing full stops and
 * stray commas do not fork an identity. What survives is letters, digits and
 * single spaces -- enough that two genuinely different people in a room still
 * differ, which is the whole basis of this being usable.
 */
export const foldParticipantName = (value: unknown) =>
  typeof value === "string"
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
    : "";

/**
 * The identity a name stands for inside one space, as a hash.
 *
 * Scoped to the space so the same name in two different clients' spaces is two
 * unrelated people, and hashed so this column cannot be read back into a list of
 * who attended a workshop -- the display name is already stored in the clear on
 * the runs the participant chose to publish, and this adds no second copy of it
 * that a dump would reveal.
 *
 * Returns null for a name that folds to nothing, so a seat without a usable name
 * has no identity rather than sharing one with every other such seat.
 */
export const participantKeyFor = async (spaceId: number, label: unknown) => {
  const folded = foldParticipantName(label);
  return folded ? await sha256Hex(`${spaceId}:${folded}`) : null;
};

/** Whether a space is inside its licence window and not switched off. */
export const spaceIsOpen = (space: SpaceRow, now = new Date()) =>
  space.status === "active" &&
  space.startsAt.getTime() <= now.getTime() &&
  space.expiresAt.getTime() > now.getTime();

/**
 * Why a space is not open, as a machine-readable reason.
 *
 * The three cases read very differently to a participant standing in a room --
 * "this starts tomorrow", "this ended", "this was switched off" -- so the reason
 * travels to the page rather than collapsing into one refusal.
 */
export const spaceClosedReason = (space: SpaceRow, now = new Date()) => {
  if (space.status !== "active") return "suspended";
  if (space.startsAt.getTime() > now.getTime()) return "not-started";
  if (space.expiresAt.getTime() <= now.getTime()) return "expired";
  return null;
};

/** What the browser is allowed to know about a space. No hashes, ever. */
export const publicSpace = (space: SpaceRow) => ({
  slug: space.slug,
  company: space.company,
  displayName: space.displayName,
  locale: space.locale,
  logoUrl: space.logoUrl,
  accentColor: space.accentColor,
  // The accent turned into a band colour and a legible ink, so the simulator
  // header and the printed report can be painted in the client's colour without
  // each page deciding for itself whether white text survives it. Null for a
  // space that set no accent, which keeps the shipped navy. See workspace-brand.
  theme: spaceTheme(space.accentColor),
  startsAt: space.startsAt,
  expiresAt: space.expiresAt,
});

/** Looks a space up by its slug. */
export const findSpaceBySlug = async (slug: string) => {
  if (!slug) return null;
  const [space] = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1);
  return space ?? null;
};

/**
 * The live seat this request is holding, or null.
 *
 * "Live" means all four of: the cookie matches a session row, that row has not
 * been revoked, the row has not expired, and the space it belongs to is still
 * open. Every one of those is re-read from the database on every call, which is
 * the property that makes suspending a space or regenerating a code take effect
 * immediately rather than whenever a cookie happens to lapse.
 *
 * Returns null for every failure, including a malformed cookie, because nothing
 * downstream should behave differently for "no cookie" and "a cookie I do not
 * like".
 */
export const resolveSession = async (request: Request) => {
  const token = readCookie(request, SPACE_COOKIE);
  if (!token || token.length < 32 || token.length > 128) return null;

  const [row] = await db
    .select({ seat: workspaceSessions, space: workspaces })
    .from(workspaceSessions)
    .innerJoin(workspaces, eq(workspaceSessions.workspaceId, workspaces.id))
    .where(and(eq(workspaceSessions.tokenHash, await sha256Hex(token)), isNull(workspaceSessions.revokedAt)))
    .limit(1);

  if (!row) return null;

  const now = new Date();
  if (row.seat.expiresAt.getTime() <= now.getTime()) return null;
  if (!spaceIsOpen(row.space, now)) return null;

  return { seat: row.seat, space: row.space };
};

/**
 * Opens a seat in a space and returns the token to put in the cookie.
 *
 * The seat expires at the earlier of a working day from now and the end of the
 * licence, so a participant is never holding a seat in a space that has since
 * closed -- and the cookie the browser gets carries that same moment, so it
 * disappears on its own rather than lingering as a credential for something
 * that no longer exists.
 */
export const openSeat = async (
  space: SpaceRow,
  role: "participant" | "sponsor",
  participantLabel: string,
) => {
  const token = generateSessionToken();
  const expiresAt = new Date(Math.min(Date.now() + SESSION_TTL_MS, space.expiresAt.getTime()));

  const [seat] = await db
    .insert(workspaceSessions)
    .values({
      workspaceId: space.id,
      tokenHash: await sha256Hex(token),
      participantLabel: participantLabel || null,
      // Computed here rather than by the caller so that every seat in the
      // database agrees on what counts as the same person.
      participantKey: await participantKeyFor(space.id, participantLabel),
      role,
      expiresAt,
    })
    .returning();

  return { token, seat, expiresAt };
};

/**
 * Which code a typed value is, or null when it is neither.
 *
 * The sponsor code is checked first so a space whose two codes were somehow set
 * to the same value grants the greater of the two roles rather than the lesser.
 */
export const matchCode = async (space: SpaceRow, typed: string) => {
  const normalized = normalizeCode(typed);
  if (normalized.length < 6) return null;
  const hash = await sha256Hex(normalized);
  if (space.sponsorCodeHash && hash === space.sponsorCodeHash) return "sponsor" as const;
  if (hash === space.accessCodeHash) return "participant" as const;
  return null;
};
