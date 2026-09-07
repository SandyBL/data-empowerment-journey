---
term: Active metadata ingestion
short: Capturing metadata as events happen — in real time, from the systems themselves — and feeding it back into the tools where people work.
group: metadata
also: Active metadata, event-driven metadata capture, real-time metadata ingestion
related: metadata, data-catalog, data-lineage, data-quality-rule
article: introduction-basics-data-governance-program
updated: 2026-09-07
---

Most catalogs were built to be crawled: a scan runs on Sunday night, and by Wednesday the catalog describes a warehouse that no longer exists. Active metadata ingestion inverts that. Every pipeline run, schema change, access grant, failed test and query against a table emits an event, and the metadata platform listens instead of asking. The point is not fresher documentation — it is that metadata arriving in seconds can be acted on automatically, which passive metadata never could.

**In practice.** Connectors subscribe to what the platform already emits: warehouse query logs, orchestration events, CDC streams, CI runs, IAM changes. Lineage is recomputed per run rather than parsed from SQL once a quarter, popularity and cost come from real usage, and the loop closes on the operational side — a failed quality rule opens a ticket for the named owner, a breaking schema change fails the producer's build, an unused table shows up on the owner's deprecation list, a new column with a personal-data signature gets flagged before anyone queries it.

**Where it goes wrong.** The feed gets built and the loop does not. Millions of events stream into a catalog that nobody opens, and the only difference from the weekly scan is the invoice. The test is whether any metadata event changes something outside the catalog: an alert, an access review, a blocked deploy. If nothing does, this is a very expensive documentation project.
