CREATE TABLE "web_vitals" (
	"id" serial PRIMARY KEY,
	"metric" varchar(8) NOT NULL,
	"value" double precision NOT NULL,
	"rating" varchar(20) NOT NULL,
	"path" varchar(256) NOT NULL,
	"locale" varchar(2),
	"form_factor" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "web_vitals_metric_created_at_idx" ON "web_vitals" ("metric","created_at");