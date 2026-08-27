-- Private simulator spaces: one company, one board, one licence window.
--
-- The three simulators stay public and free. This adds the second axis they are
-- read on: a `workspaces` row is a space sold to a company, a
-- `workspace_sessions` row is one browser that entered that space's code, and
-- `simulator_scores.workspace_id` says which board a run belongs to.
--
-- Nothing here changes an existing row or an existing read. `workspace_id` is
-- nullable and NULL means the public board, which is what every row already on
-- the boards is, so the public leaderboards are byte-for-byte what they were
-- before this ran. That is the whole reason the column is nullable rather than
-- defaulted to a "public" workspace row: a sentinel would have needed every
-- existing row rewritten and every existing query changed.
--
-- Sessions are opaque random tokens stored as SHA-256, and the access codes on
-- `workspaces` are stored the same way. Neither can be read back out of this
-- table -- a lost code is replaced, never recovered -- and revoking access is an
-- UPDATE rather than a wait for a signed token to expire.
--
-- The two new indexes on `simulator_scores` coexist deliberately. The composite
-- one leads on `workspace_id` because every board read is scoped to one space
-- (or to the public NULL pool); the older `(simulator, score)` one survives
-- because the admin console asks the opposite question -- one simulator across
-- every space -- and cannot use an index it does not lead.
CREATE TABLE "workspace_sessions" (
	"id" serial PRIMARY KEY,
	"workspace_id" integer NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"participant_label" varchar(60),
	"role" varchar(20) DEFAULT 'participant' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY,
	"slug" varchar(40) NOT NULL,
	"company" varchar(120) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"access_code_hash" varchar(64) NOT NULL,
	"sponsor_code_hash" varchar(64),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"locale" varchar(2) DEFAULT 'en' NOT NULL,
	"logo_url" varchar(300),
	"accent_color" varchar(20),
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulator_scores" ADD COLUMN "workspace_id" integer;--> statement-breakpoint
ALTER TABLE "simulator_scores" ADD COLUMN "workspace_session_id" integer;--> statement-breakpoint
ALTER TABLE "simulator_scores" ADD COLUMN "breakdown" jsonb;--> statement-breakpoint
CREATE INDEX "simulator_scores_workspace_simulator_score_idx" ON "simulator_scores" ("workspace_id","simulator","score");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_sessions_token_hash_idx" ON "workspace_sessions" ("token_hash");--> statement-breakpoint
CREATE INDEX "workspace_sessions_workspace_idx" ON "workspace_sessions" ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_slug_idx" ON "workspaces" ("slug");--> statement-breakpoint
ALTER TABLE "simulator_scores" ADD CONSTRAINT "simulator_scores_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "simulator_scores" ADD CONSTRAINT "simulator_scores_egbvdJYbguRj_fkey" FOREIGN KEY ("workspace_session_id") REFERENCES "workspace_sessions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "workspace_sessions" ADD CONSTRAINT "workspace_sessions_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;