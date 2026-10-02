CREATE TABLE "newsletter_articles" (
	"id" serial PRIMARY KEY,
	"url" varchar(512) NOT NULL,
	"locale" varchar(2) NOT NULL,
	"title" varchar(300) NOT NULL,
	"summary" text,
	"published_at" timestamp with time zone,
	"announce" boolean NOT NULL,
	"discovered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_batches" (
	"id" serial PRIMARY KEY,
	"locale" varchar(2) NOT NULL,
	"resend_segment_id" varchar(64) NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_deliveries" (
	"id" serial PRIMARY KEY,
	"article_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"recipients" integer NOT NULL,
	"resend_broadcast_id" varchar(64),
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY,
	"email" varchar(254) NOT NULL,
	"locale" varchar(2) NOT NULL,
	"source" varchar(120),
	"resend_contact_id" varchar(64),
	"batch_id" integer,
	"unsubscribe_token" varchar(64) NOT NULL,
	"welcome_sent_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_articles_url_idx" ON "newsletter_articles" ("url");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_deliveries_article_batch_idx" ON "newsletter_deliveries" ("article_id","batch_id");--> statement-breakpoint
CREATE INDEX "newsletter_deliveries_sent_at_idx" ON "newsletter_deliveries" ("sent_at");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_unsubscribe_token_idx" ON "newsletter_subscribers" ("unsubscribe_token");--> statement-breakpoint
ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_article_id_newsletter_articles_id_fkey" FOREIGN KEY ("article_id") REFERENCES "newsletter_articles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_batch_id_newsletter_batches_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "newsletter_batches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_batch_id_newsletter_batches_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "newsletter_batches"("id");