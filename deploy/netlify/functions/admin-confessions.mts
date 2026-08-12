import { getUser } from "@netlify/identity";
import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { confessionSubmissions } from "../../db/schema.js";

// Roles allowed to moderate the Confession Wall. A general site administrator
// counts too, so a single exact role name cannot lock the owner out of their own
// moderation queue. Blog editing is not checked here at all — Git Gateway
// authorizes CMS commits. Keep in sync with assets/js/admin-studio.js.
const moderatorRoles = ["confession-admin", "admin", "owner"];

const canModerate = (roles: string[] | undefined) =>
  (roles ?? []).some((role) => moderatorRoles.includes(role.toLowerCase()));

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export default async (request: Request) => {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!canModerate(user.roles)) {
    return Response.json({ error: "Confession administrator access required" }, { status: 403 });
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
