import { doublePrecision, index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

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

/**
 * Core Web Vitals as real visitors experienced them.
 *
 * Lab tools measure one machine on one connection; this is the distribution
 * Google actually ranks on. Deliberately anonymous: a metric, a number, the
 * page it happened on and a coarse connection hint, with no address, no user
 * agent and nothing that joins two rows into a person. That is enough to answer
 * "is the largest paint on the homepage getting worse" and not enough to answer
 * anything about who was looking at it.
 */
export const webVitals = pgTable(
  "web_vitals",
  {
    id: serial().primaryKey(),
    // LCP, INP, CLS, FCP or TTFB.
    metric: varchar({ length: 8 }).notNull(),
    value: doublePrecision().notNull(),
    // "good" | "needs-improvement" | "poor", using Google's own thresholds so
    // the rating cannot drift from what Search Console reports.
    rating: varchar({ length: 20 }).notNull(),
    // Pathname only. Query strings and fragments are dropped before sending.
    path: varchar({ length: 256 }).notNull(),
    locale: varchar({ length: 2 }),
    // "mobile" or "desktop", derived from viewport width rather than sniffing.
    formFactor: varchar("form_factor", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Every query this feeds is "the last N days of one metric", so the index
    // that matters is the one that answers it without a full scan.
    index("web_vitals_metric_created_at_idx").on(table.metric, table.createdAt),
  ],
);

