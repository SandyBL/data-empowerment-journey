import { doublePrecision, index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

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
 * Global simulator leaderboard.
 *
 * The three simulators used to keep their rankings in localStorage, which meant
 * every visitor saw a board containing only themselves and a few hardcoded
 * example names. One table serves all three: `simulator` says which board a row
 * belongs to, and each board is a single worldwide pool rather than one per
 * language, so a visitor in Lisbon is ranked against a visitor in Madrid.
 *
 * Only what the board displays is stored: the display name the player typed,
 * their score, how long the run took, and the one secondary figure the Data
 * Literacy board ranks ties on. The profile or tier label is deliberately NOT
 * stored -- it is a pure function of the score, so each page derives it and
 * shows it in its own language instead of leaking the submitter's language into
 * everyone's table.
 *
 * `score` scales differ per simulator (0-100 for governance, 0-15 for literacy,
 * 0-1000 for ownership) and are validated per simulator in the write function.
 */
export const simulatorScores = pgTable(
  "simulator_scores",
  {
    id: serial().primaryKey(),
    // Slug of the simulator, matching its URL segment.
    simulator: varchar({ length: 40 }).notNull(),
    // Language the run was played in. Kept for analytics only: it does not
    // partition the board.
    locale: varchar({ length: 2 }).notNull(),
    // Free text the player typed, e.g. "Maria Silva - CDO". Never an email.
    playerName: varchar("player_name", { length: 60 }).notNull(),
    score: doublePrecision().notNull(),
    // Second ranking figure where the simulator has one (Data Literacy's data
    // asset value). Null for the boards that rank on score alone.
    extraScore: doublePrecision("extra_score"),
    // Wall-clock milliseconds the run took, from the first question appearing to
    // the last answer being recorded. Ties on score are ranked on this, so a
    // perfect run answered quickly outranks a perfect run answered slowly.
    //
    // Nullable, and deliberately so: rows published before the boards were timed
    // have no honest value to put here, and the Data Governance board does not
    // time itself at all. `ORDER BY duration_ms ASC` puts NULLs last in
    // Postgres, which is the reading we want -- an untimed run never outranks a
    // timed one on the same score.
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Every read is "the top N rows of one board", so simulator then score is
    // the index that answers it; Postgres walks it backwards for DESC. The tie
    // breakers are left out on purpose: they only ever reorder rows that already
    // share a score, which is a handful of rows out of the ten being returned.
    index("simulator_scores_simulator_score_idx").on(table.simulator, table.score),
  ],
);

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

