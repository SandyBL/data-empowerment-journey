ALTER TABLE "simulator_scores" ADD COLUMN "department" varchar(80);--> statement-breakpoint
ALTER TABLE "workspace_sessions" ADD COLUMN "department" varchar(80);--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "simulators" jsonb;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "participant_code" varchar(20);--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "departments" jsonb;