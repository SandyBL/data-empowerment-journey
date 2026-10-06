DROP INDEX "newsletter_subscribers_email_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_locale_idx" ON "newsletter_subscribers" ("email","locale");