import type { Config } from "@netlify/functions";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { confessionSubmissions } from "../../db/schema.js";

// Reads the published Confession Wall. Writing is a separate function
// (confession-submit.mts) on this same path, because the two need rate limits
// an order of magnitude apart: reading is what every visitor does on page load,
// posting is what a spam script would do thousands of times. Netlify routes on
// method as well as path, so each side gets the limit that fits it.

const supportedLocales = new Set(["en", "es", "pt"]);

export default async (request: Request) => {
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
};

export const config: Config = {
  path: "/api/confessions",
  method: ["GET"],
  // Generous enough that a shared office or mobile-carrier address never trips
  // it — the page makes one request per visit — while still capping the
  // database queries a single address can force.
  rateLimit: {
    windowSize: 60,
    windowLimit: 60,
    aggregateBy: "ip",
  },
};
