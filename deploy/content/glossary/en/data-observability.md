---
term: Data observability
short: Continuous, automated monitoring of the data itself — volume, freshness, schema and distribution — so silent failures surface before a consumer finds them.
group: quality
also: Observability, continuous observability, automated observability, pipeline monitoring, data monitoring
related: data-validation, data-lineage, data-quality-sla, root-cause-analysis, data-pipeline
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

A pipeline that crashes raises an alert. The expensive failures are the ones that do not: a table that loads half its usual rows, a feed that stops updating, an upstream column that changes type without notice. Observability watches for those signals continuously — row counts, freshness against schedule, schema drift, values drifting from their usual range — and tells someone when the data is behaving unlike itself.

**In practice.** Monitor the tables behind the decisions that matter first, and route every alert to a named steward, not a shared channel. Pair it with lineage, so an alert on a source table immediately shows which dashboards and models sit downstream. Observability is good at saying that something changed; deciding whether the change is a problem is still a job for someone who knows the business.

**Where it goes wrong.** A tool is switched on across the whole warehouse, learns thousands of baselines, and fires on every month-end spike and holiday dip. The team mutes it within weeks. The other failure is treating observability as a replacement for validation: it notices bad data after it has landed, which is useful, but it does not stop it getting in.
