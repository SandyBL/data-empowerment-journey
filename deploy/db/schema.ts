import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const confessionSubmissions = pgTable("confession_submissions", {
  id: serial().primaryKey(),
  locale: varchar({ length: 2 }).notNull(),
  role: varchar({ length: 160 }).notNull(),
  category: varchar({ length: 80 }),
  title: varchar({ length: 180 }).notNull(),
  story: text().notNull(),
  status: varchar({ length: 20 }).notNull().default("pending"),
  expertComment: text("expert_comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});
