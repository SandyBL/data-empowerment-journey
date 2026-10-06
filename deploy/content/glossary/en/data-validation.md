---
term: Data validation
short: Automated checks that confirm data matches its expected structure, format and business rules before it is allowed further down the pipeline.
group: quality
also: Validation checks, automated validation, schema validation, validation controls, data validation checks
related: data-quality-rule, data-pipeline, data-observability, data-contract, data-profiling
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Validation is the gate. At ingestion it enforces the schema, rejects negative transaction amounts and malformed emails, and checks that mandatory keys are populated. During transformation it checks that a return has a matching purchase and that totals reconcile between source and target. Records that fail are rejected or quarantined rather than passed along, because the cheapest place to fix bad data is before anything has been built on top of it.

**In practice.** Put the first checks at the points where unvalidated data currently enters: API ingestion and manual file uploads are the usual suspects. Start light — schema, completeness, a few range checks on high-priority tables — and add business-rule validation where incidents show you need it. A failed check should halt the load or route records to a quarantine table, and somebody should own what lands there.

**Where it goes wrong.** Checks log failures and let everything through, so validation becomes a report of what went wrong yesterday. Or the quarantine table exists and nobody looks at it, which is just a slower way of losing records. Validation without a decision about what happens on failure is monitoring with extra steps.
