---
term: Data pipeline
short: An automated sequence of steps that moves data from where it is produced to where it is used, transforming it along the way.
group: architecture
also: ETL pipeline, ELT pipeline, integration pipeline, transformation pipeline
match: Data pipelines, ETL pipelines, ELT pipelines, integration pipelines, transformation pipelines
related: data-validation, data-observability, data-lineage, data-contract, data-quality-rule
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

A pipeline is the plumbing between a source system and a report, a model or another system: ingest, validate, transform, load, repeat on a schedule. Building and running pipelines is data management work. Governance does not write them, but it decides what they must respect: which source is authoritative, which fields are classified, what quality tolerance applies, and who gets told when something upstream changes.

**In practice.** The dangerous failure is rarely the crash. A pipeline that stops raises an alert and someone fixes it by lunchtime. The one that keeps running with a null in the wrong place or a mismatched currency code quietly turns a bad record into a bad aggregate into a bad decision. Checks belong at every critical stage, not just at the end, and a failed check on critical data should halt the run or send the records to quarantine rather than let them through with a warning.

**Where it goes wrong.** Every team builds its own pipeline from the same source, each with slightly different logic, and nobody owns the differences. Then an upstream schema changes without notice, half the pipelines break silently, and the discrepancy is found by an auditor. Fixing the pipeline is management. Deciding who must be told before the schema changes is governance.
