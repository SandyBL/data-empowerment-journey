import type { Config } from "@netlify/functions";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { confessionSubmissions } from "../../db/schema.js";

const supportedLocales = new Set(["en", "es", "pt"]);

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export default async (request: Request) => {
  if (request.method === "GET") {
    const locale = new URL(request.url).searchParams.get("locale")?.toLowerCase() ?? "";

    if (!supportedLocales.has(locale)) {
      return Response.json({ error: "Invalid locale" }, { status: 400 });
    }

    const submissions = await db
      .select({
        id: confessionSubmissions.id,
        role: confessionSubmissions.role,
        category: confessionSubmissions.category,
        title: confessionSubmissions.title,
        story: confessionSubmissions.story,
        expertComment: confessionSubmissions.expertComment,
        publishedAt: confessionSubmissions.publishedAt,
      })
      .from(confessionSubmissions)
      .where(and(eq(confessionSubmissions.locale, locale), eq(confessionSubmissions.status, "published")))
      .orderBy(desc(confessionSubmissions.publishedAt));

    return Response.json({ submissions });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

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
  } catch {
    return Response.json({ error: "Unable to save submission" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/confessions",
  method: ["GET", "POST"],
};
