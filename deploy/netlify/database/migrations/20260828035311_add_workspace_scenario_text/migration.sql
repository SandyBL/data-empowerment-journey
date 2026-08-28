-- Per-company scenario wording: text overrides, and nothing but text.
--
-- A private space already gets the client's name, logo and accent colour. This
-- adds the wording: one row per (space, simulator, language) holding
-- `{ "<scenario id>": { "<field path>": "<replacement>" } }`, so a consultant
-- can make the ten governance dilemmas read like the client's own systems and
-- teams before a workshop.
--
-- Nothing here changes an existing row or an existing read. A space with no row
-- in this table plays the shipped wording, which is every space that exists
-- today, and the public simulators never read this table at all. The scenario
-- count, the options, which option is right and every number a decision moves
-- stay in the page: they are not in this table and cannot be overridden, which
-- is what keeps a private score comparable to a public one and the facilitator
-- report grouping on the same dimension keys.
--
-- The unique index is the rule that one space cannot hold two versions of the
-- same simulator in the same language. In the database rather than in the save
-- handler, because the duplicate that a race would let through is a space where
-- which wording a participant sees depends on row order.

CREATE TABLE "workspace_scenario_text" (
	"id" serial PRIMARY KEY,
	"workspace_id" integer NOT NULL,
	"simulator" varchar(40) NOT NULL,
	"locale" varchar(2) NOT NULL,
	"overrides" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_scenario_text_space_simulator_locale_idx" ON "workspace_scenario_text" ("workspace_id","simulator","locale");--> statement-breakpoint
ALTER TABLE "workspace_scenario_text" ADD CONSTRAINT "workspace_scenario_text_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;