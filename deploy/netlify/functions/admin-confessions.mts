import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { confessionSubmissions } from "../../db/schema.js";

// Moderating the Confession Wall requires an authorized Netlify Identity
// account and nothing more. That is the same bar the Blog Content Studio
// clears through Git Gateway, so a signed-in editor is never turned away from
// one tool while holding the keys to the other. Access is controlled by who is
// invited into Identity, so keep registration set to "Invite only".
// Keep in sync with assets/js/admin-studio.js.

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export default async (request: Request) => {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  if (request.method === "GET") {
    const submissions = await db
      .select()
      .from(confessionSubmissions)
      .where(eq(confessionSubmissions.status, "pending"))
      .orderBy(desc(confessionSubmissions.createdAt));

    return Response.json({ submissions });
  }

  if (request.method === "PATCH") {
    try {
      const payload = await request.json();
      const id = Number(payload.id);
      const action = cleanText(payload.action, 20);
      const expertComment = cleanText(payload.expertComment, 3000);

      if (!Number.isInteger(id) || id < 1 || !["publish", "reject"].includes(action)) {
        return Response.json({ error: "Invalid moderation request" }, { status: 400 });
      }

      if (action === "publish" && expertComment.length < 20) {
        return Response.json({ error: "Add a helpful expert comment before publishing" }, { status: 400 });
      }

      const [updated] = await db
        .update(confessionSubmissions)
        .set(action === "publish"
          ? { status: "published", expertComment, publishedAt: new Date() }
          : { status: "rejected", expertComment: null, publishedAt: null })
        .where(eq(confessionSubmissions.id, id))
        .returning({ id: confessionSubmissions.id, status: confessionSubmissions.status });

      if (!updated) {
        return Response.json({ error: "Submission not found" }, { status: 404 });
      }

      return Response.json({ submission: updated });
    } catch {
      return Response.json({ error: "Unable to moderate submission" }, { status: 500 });
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/admin/confessions",
  method: ["GET", "PATCH"],
};
