import type { Config } from "@netlify/functions";
import {
  cleanLine,
  findSpaceBySlug,
  foldParticipantName,
  hintCookie,
  matchCode,
  normalizeSlug,
  openSeat,
  publicSpace,
  sessionCookie,
  spaceClosedReason,
} from "../lib/workspace-access.js";

// Turns an access code into a seat in a private space.
//
// This is the only endpoint that accepts a code, and the only one that issues a
// cookie. Everything downstream — the private board, the sponsor report, the
// branded header — resolves the cookie against the database and never looks at
// a code again, so the blast radius of a leaked code is "somebody can join the
// space until you regenerate it", not "somebody can read the report".
//
// The reason a space is shut is returned rather than collapsed into a refusal.
// A facilitator standing in front of a room needs to know whether they are
// early, late, or looking at a suspended space, and "incorrect code" would send
// them hunting for the wrong problem. A wrong code, by contrast, says only that
// it is wrong: which of the two codes was closer is not a hint anyone should be
// given.

const MAX_LABEL_LENGTH = 60;

/**
 * Shortest name that opens a seat, measured after folding.
 *
 * The name used to be optional garnish for the leaderboard. It is now the thread
 * that ties a participant's two sittings together, so it has to be asked for
 * rather than offered: a room that joins anonymously on Monday has no way to be
 * shown its outstanding simulators on Tuesday, and there is nothing the server
 * can do about it afterwards.
 *
 * Two characters, not one, because a single letter is a keystroke rather than a
 * name and would quietly merge everyone in the room who pressed the same one.
 * This is the floor of a weak identity, not a validation of real names -- short
 * names exist, and it is not this endpoint's business to argue with one.
 */
const MIN_FOLDED_NAME_LENGTH = 2;

export default async (request: Request) => {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed body" }, { status: 400 });
  }

  const slug = normalizeSlug(payload?.slug);
  const code = typeof payload?.code === "string" ? payload.code : "";
  const label = cleanLine(payload?.label, MAX_LABEL_LENGTH);

  if (!slug) return Response.json({ error: "Missing space" }, { status: 400 });

  // Checked before the code so somebody who left the field blank is told that,
  // rather than being sent back to re-read a code that was already correct.
  if (foldParticipantName(label).length < MIN_FOLDED_NAME_LENGTH) {
    return Response.json(
      { error: "Please enter the name you want to play under", reason: "missing-name" },
      { status: 400 },
    );
  }

  try {
    const space = await findSpaceBySlug(slug);

    if (!space) {
      return Response.json({ error: "Unknown space", reason: "not-found" }, { status: 404 });
    }

    const closed = spaceClosedReason(space);
    if (closed) {
      // 403 and not 401: no code will open this, so a client that retries with
      // a better one is wasting the room's time.
      return Response.json(
        { error: "This space is not open", reason: closed, space: publicSpace(space) },
        { status: 403 },
      );
    }

    const role = await matchCode(space, code);
    if (!role) {
      return Response.json({ error: "Incorrect access code", reason: "bad-code" }, { status: 401 });
    }

    const { token, expiresAt } = await openSeat(space, role, label);

    // Two cookies, so two Set-Cookie lines, which a plain object cannot express:
    // the seat itself (HttpOnly, the actual credential) and the readable hint
    // that lets a simulator page hide the public header before its first paint.
    // The hint is issued here and only here, because this is the only moment at
    // which the server knows a browser has just entered a space.
    const headers = new Headers({ "Cache-Control": "no-store" });
    headers.append("Set-Cookie", sessionCookie(token, expiresAt));
    headers.append("Set-Cookie", hintCookie(expiresAt));

    return Response.json(
      { joined: true, role, label, expiresAt, space: publicSpace(space) },
      { status: 201, headers },
    );
  } catch (error) {
    console.error("Workspace join failed", error);
    return Response.json({ error: "Unable to join this space", retryable: true }, { status: 503 });
  }
};

export const config: Config = {
  path: "/api/workspace/join",
  method: ["POST"],
  // Sized for a room, not for one person. Thirty people joining a workshop are
  // thirty requests from a single office address inside a couple of minutes, so
  // a limit tuned to "one human joins once" would lock the back half of the
  // room out of their own session — which is exactly the failure a paying
  // client would notice first. Sixty attempts per five minutes is comfortable
  // for a large room and still hopeless against a twelve-character code drawn
  // from a thirty-symbol alphabet: an attacker gets roughly seventeen thousand
  // guesses a day against a space of about 5e17.
  rateLimit: {
    windowSize: 300,
    windowLimit: 60,
    aggregateBy: "ip",
  },
};
