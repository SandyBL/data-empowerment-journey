CREATE TABLE "confession_submissions" (
	"id" serial PRIMARY KEY,
	"locale" varchar(2) NOT NULL,
	"role" varchar(160) NOT NULL,
	"category" varchar(80),
	"title" varchar(180) NOT NULL,
	"story" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
