CREATE TABLE "simulator_scores" (
	"id" serial PRIMARY KEY,
	"simulator" varchar(40) NOT NULL,
	"locale" varchar(2) NOT NULL,
	"player_name" varchar(60) NOT NULL,
	"score" double precision NOT NULL,
	"extra_score" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "simulator_scores_simulator_score_idx" ON "simulator_scores" ("simulator","score");