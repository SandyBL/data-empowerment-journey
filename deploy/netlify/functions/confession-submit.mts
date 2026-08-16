import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { confessionSubmissions } from "../../db/schema.js";

// Accepts anonymous Confession Wall submissions. This is the only endpoint on
// the site that lets an unauthenticated visitor write to the database, so it is
// also the only one worth flooding: every accepted row lands in the moderation
// queue a person has to read. The rate limit below is enforced at the edge,
// before this function runs, so a flood costs no function invocations and no
// database connections.
//
// Read traffic lives in confession-submissions.mts on this same path. Keep the
// validation rules here in step with the client-side checks in
// assets/js/confession-wall.js — the client's are a courtesy, these are the
// real ones.

const supportedLocales = new Set(["en", "es", "pt"]);

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export default async (request: Request) => {
  try {
    const payload = await request.json();
    const locale = cleanText(payload.locale, 2).toLowerCase();
    const role = cleanText(payload.role, 160);
    const category = cleanText(payload.category, 80);
    const title = cleanText(payload.title, 180);
    const story = cleanText(payload.story, 5000);

    if (!supportedLocales.has(locale) || !role || !title || story.length < 20) {
      return Response.json({ error: "Invalid submission" }, { status: 400 });
    }

    await db.insert(confessionSubmissions).values({
      locale,
      role,
      category: category || null,
      title,
      story,
    });

    return Response.json({ accepted: true }, { status: 201 });
  } catch (error) {
    // Logged rather than swallowed: without this, a schema drift or a lost
    // database connection is indistinguishable from a malformed request body,
    // and the only symptom anyone sees is submissions quietly failing.
    console.error("Confession submission failed", error);
    return Response.json({ error: "Unable to save submission" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/confessions",
  method: ["POST"],
  // A confession takes minutes to write, so five in ten minutes is well beyond
  // what any person does and far below what makes a spam run worthwhile.
  rateLimit: {
    windowSize: 600,
    windowLimit: 5,
    aggregateBy: "ip",
  },
};
