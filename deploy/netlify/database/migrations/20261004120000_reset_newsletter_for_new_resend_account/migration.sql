-- Starts the newsletter list over for the new Resend account.
--
-- The subscriber, batch and delivery rows written so far all point at contacts
-- and a segment in the previous Resend account, which is no longer used. The
-- list held a single subscriber, already unsubscribed by hand in that account,
-- and no broadcast had gone out, so nothing is lost by clearing them: the next
-- signup opens a fresh batch and segment in the new account.
--
-- newsletter_articles is kept on purpose. It records which articles were
-- already published when the newsletter started, and emptying it would make
-- the next hourly run treat the current feed as a starting point again rather
-- than announce what is new.
--
-- Data-only, so there is no schema change and no snapshot alongside it.
DELETE FROM "newsletter_deliveries";
DELETE FROM "newsletter_subscribers";
DELETE FROM "newsletter_batches";
