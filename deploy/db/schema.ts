import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

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
 * A private simulator space sold to one company.
 *
 * The three simulators are free and public, and stay that way. What a company
 * buys is this: a space of their own where the same simulators run, the
 * leaderboard contains their people and nobody else's, the session carries their
 * name, and a facilitator report at the end says what the room actually
 * struggled with. Access lasts exactly as long as `expiresAt` says it does.
 *
 * Two codes rather than one. `accessCodeHash` is the code a facilitator reads
 * out to the room, and it grants a seat. `sponsorCodeHash` is the one handed to
 * the client sponsor, and it grants a seat plus the report -- so the person
 * paying can read the aggregate without every participant seeing how the room
 * scored as a whole. Both are stored as SHA-256 of the normalised code and never
 * kept in the clear: a code cannot be recovered from this table, only replaced,
 * which is why the admin console shows a new code exactly once.
 *
 * `status` is the kill switch. `expiresAt` is the licence, and it is the normal
 * way access ends; setting status to "suspended" is what ends it early, and it
 * takes effect on the next request because every entry point re-reads this row
 * rather than trusting anything the browser is holding.
 */
export const workspaces = pgTable(
  "workspaces",
  {
    id: serial().primaryKey(),
    // URL segment, e.g. "acme-q1-2026" in /w/acme-q1-2026/. Lowercase, dashed.
    slug: varchar({ length: 40 }).notNull(),
    // Legal or trading name of the client, for your own records.
    company: varchar({ length: 120 }).notNull(),
    // What participants see in the header, e.g. "ACME Data Governance Week".
    displayName: varchar("display_name", { length: 120 }).notNull(),
    accessCodeHash: varchar("access_code_hash", { length: 64 }).notNull(),
    // Nullable: a space can be sold without a sponsor seat.
    sponsorCodeHash: varchar("sponsor_code_hash", { length: 64 }),
    // "active" | "suspended".
    status: varchar({ length: 20 }).notNull().default("active"),
    // Language the space hub opens in. Participants can still switch, because
    // the simulators exist in all three and a room is rarely monolingual.
    locale: varchar({ length: 2 }).notNull().default("en"),
    // Optional client branding. A URL rather than an upload: a logo already
    // lives on the client's own site, and copying it here would make this table
    // responsible for storing files.
    logoUrl: varchar("logo_url", { length: 300 }),
    // A single hex accent, applied as a CSS custom property. Deliberately one
    // colour and not a theme: enough for the space to read as theirs, not enough
    // for a broken value to make a page unreadable.
    accentColor: varchar("accent_color", { length: 20 }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // The slug is the address, so two spaces cannot share one. Enforced here
    // rather than in the function that creates them: a uniqueness rule that
    // lives in application code is a rule that holds until two requests arrive
    // at the same moment.
    uniqueIndex("workspaces_slug_idx").on(table.slug),
  ],
);

/**
 * One seat in a space: a browser that entered a valid code.
 *
 * Sessions are opaque random tokens, hashed here the way the access codes are.
 * That is a deliberate choice over a signed cookie: a signed token needs a
 * signing secret to exist before anything works, cannot be revoked before it
 * expires, and tells you nothing about who is in the room. A row per seat costs
 * one indexed lookup per request and buys instant revocation, an honest count of
 * how many people actually joined, and a per-participant handle that the
 * leaderboard can attribute a run to.
 *
 * `role` is "participant" or "sponsor" -- see the two codes on `workspaces`.
 *
 * `participantLabel` is free text, exactly like the display name on the
 * leaderboard: it is what somebody typed to be recognised by their colleagues,
 * and it is never an email.
 *
 * `participantKey` is that same name turned into an identity, and it is what
 * makes a workshop that spans two sittings work. A room rarely plays all three
 * simulators in one go: somebody finishes one, closes the laptop, and comes back
 * the next morning to a browser whose seat has expired. Before this column the
 * only handle on a person was the seat itself, so the second visit was a
 * stranger -- a new row, a second head in the count, and no way for the hub to
 * say which two exercises were still outstanding.
 *
 * So the name is a weak identity, and deliberately a weak one. It is not a
 * credential: the access code is what opens the space, and this only decides
 * which pile of finished runs a seat is joined to once it is already inside. Two
 * people who type the same name in the same space are treated as one person,
 * which is a real limitation and an acceptable one for a facilitated room where
 * names are read off a leaderboard -- and the reason the gate now asks for the
 * name rather than offering it.
 *
 * Stored as a hash of the space id and the folded name rather than the name
 * itself, so this column cannot be read back into a list of who attended, and
 * indexed with the space because every lookup is "this person, in this space".
 * Null for a seat opened without a name, which is every seat that existed before
 * the field was required; those keep the old behaviour of counting as one person
 * each.
 */
export const workspaceSessions = pgTable(
  "workspace_sessions",
  {
    id: serial().primaryKey(),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // SHA-256 of the token in the cookie. Reading this table hands out nothing.
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    participantLabel: varchar("participant_label", { length: 60 }),
    // SHA-256 of `<workspace id>:<folded name>`. See the note above: an identity
    // for continuity, never an authorisation.
    participantKey: varchar("participant_key", { length: 64 }),
    role: varchar({ length: 20 }).notNull().default("participant"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Updated when a seat publishes a run, not on every read: the point of it is
    // "did this seat do anything", and a write on every page load would make the
    // leaderboard a write endpoint.
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    // Never later than the space's own expiry, and capped to it on creation.
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // Set when a code is regenerated or a space is suspended, so one seat can be
    // ended without deleting the run it published.
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    // Every request that carries a space cookie resolves it through this, so it
    // is both the uniqueness rule and the only index that matters here.
    uniqueIndex("workspace_sessions_token_hash_idx").on(table.tokenHash),
    index("workspace_sessions_workspace_idx").on(table.workspaceId),
    // "Every seat this person has held in this space", which is the question the
    // hub asks to mark a simulator done and the report asks to count people
    // rather than seats. Not unique: a returning participant opens a new seat
    // each time, and that history is worth keeping.
    index("workspace_sessions_workspace_participant_idx").on(table.workspaceId, table.participantKey),
  ],
);

/**
 * Simulator leaderboards, public and private.
 *
 * The three simulators used to keep their rankings in localStorage, which meant
 * every visitor saw a board containing only themselves and a few hardcoded
 * example names. One table serves all three: `simulator` says which board a row
 * belongs to, and the public board is a single worldwide pool rather than one
 * per language, so a visitor in Lisbon is ranked against a visitor in Madrid.
 *
 * `workspaceId` is the second axis. NULL means the public board -- the one every
 * visitor plays and the only one that existed before private spaces -- and a
 * value means the row belongs to one company's space and is visible only inside
 * it. Nullable rather than defaulted precisely because NULL already meant
 * "public" for every row written before this column existed, so no row had to be
 * rewritten and no board changed shape.
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
    // The private board this run belongs to, or NULL for the public one. See the
    // note above: NULL is not a missing value here, it is the public pool.
    workspaceId: integer("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
    // Which seat in that space published the run. Kept so the facilitator report
    // can count people rather than runs, and so a replay can be attributed to
    // the browser that already published one. Set to NULL rather than deleted
    // with the seat, because the run still happened.
    workspaceSessionId: integer("workspace_session_id").references(() => workspaceSessions.id, {
      onDelete: "set null",
    }),
    // Per-dimension result of the run, as `{ "<stable-key>": 0-100 }`.
    //
    // This is what turns a private space into something worth paying for: a
    // score alone says a room did well or badly, and this says which of the five
    // dimensions it did badly at, which is the sentence a facilitator actually
    // needs. The keys are the simulators' own internal identifiers rather than
    // their labels, so the same key means the same dimension whether the run was
    // played in English, Spanish or Portuguese.
    //
    // Nullable and unvalidated against a fixed list on purpose: a simulator that
    // grows a sixth dimension must not start failing to publish. Shape, size and
    // range are bounded in the write function; meaning is not.
    breakdown: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Every read is "the top N rows of one board", and a board is now a space
    // plus a simulator, so the space has to lead: without it the public board
    // and every private one share the same index prefix and each read filters
    // rows it cannot show. NULL is an ordinary indexable value in a Postgres
    // btree, so this one index answers the public board too.
    //
    // The tie breakers are left out on purpose: they only ever reorder rows that
    // already share a score, which is a handful of rows out of the ten being
    // returned.
    index("simulator_scores_workspace_simulator_score_idx").on(
      table.workspaceId,
      table.simulator,
      table.score,
    ),
    // Kept alongside it, and not replaced by it. The composite above cannot
    // answer "this simulator across every space", which is the shape of every
    // question the admin console and the cross-space analytics ask, because
    // `simulator` is not its leading column.
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


/**
 * The wording one company had rewritten, for one simulator, in one language.
 *
 * A private space is the same three simulators everybody else plays. What a
 * consulting engagement usually needs on top of that is smaller than a new
 * simulator and bigger than a logo: the scenarios have to sound like the client
 * -- their systems, their team names, the incident they actually had last
 * quarter -- or a room spends the first two minutes arguing that "this is not
 * how it works here" instead of deciding who owns the metric.
 *
 * So this table stores text and only text. `overrides` is
 * `{ "<scenario id>": { "<field path>": "<replacement>" } }`, and the field
 * paths it may contain are whitelisted in netlify/lib/scenario-fields.mjs:
 * titles, descriptions, option wording, lessons. Never an `impact`, never
 * `optimalChoice`, never `correctRole`, never the number of scenarios. That
 * boundary is the reason a private run is still comparable to a public one --
 * the score bounds in simulator-score-submit.mts hold, and the facilitator
 * report still groups on the same dimension keys -- and it is enforced when the
 * admin console saves rather than trusted here.
 *
 * A missing row means the standard wording, which is why overriding is a row
 * per (space, simulator, language) rather than a column on `workspaces`: nine
 * sets exist per space, an engagement usually rewrites one or two of them, and
 * the ones nobody touched must stay byte-for-byte the shipped text so a fix to a
 * scenario reaches every space that did not override it.
 *
 * Deliberately jsonb rather than a row per field. The document is only ever read
 * whole -- one simulator page asks for exactly one of these and applies all of
 * it -- and a row per field would turn one indexed read into a hundred and give
 * the console a hundred writes to reconcile on every save.
 */
export const workspaceScenarioText = pgTable(
  "workspace_scenario_text",
  {
    id: serial().primaryKey(),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // Slug of the simulator, matching its URL segment and `simulator_scores`.
    simulator: varchar({ length: 40 }).notNull(),
    // Which of the three translations this rewrites. A space that runs a
    // bilingual room overrides two rows and gets two rewritten simulators.
    locale: varchar({ length: 2 }).notNull(),
    // `{ "<scenario id>": { "<field path>": "<text>" } }`. Sanitised, bounded
    // and whitelisted on write; see netlify/lib/scenario-text.ts.
    overrides: jsonb().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Shown in the console next to each customised set, because "which of these
    // nine did I already do" is the question an engagement actually asks.
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One set per space, simulator and language. Enforced here rather than in
    // the console's save handler: a uniqueness rule in application code is a
    // rule that holds until two saves arrive at the same moment, and the
    // duplicate that slips through would be a space where which wording a
    // participant sees depends on row order.
    uniqueIndex("workspace_scenario_text_space_simulator_locale_idx").on(
      table.workspaceId,
      table.simulator,
      table.locale,
    ),
  ],
);
