---
term: Data deduplication
short: Finding records that describe the same real-world entity and resolving them into one, using agreed business keys and matching rules.
group: quality
also: Deduplication, duplicate detection, deduplication routines, entity resolution, record matching
related: master-data-management, single-source-of-truth, data-profiling, data-quality-dimensions, critical-data-element
article: why-data-quality-is-a-business-imperative
updated: 2026-10-06
---

The same customer appears three times with slightly different spellings, two addresses and one email between them. Deduplication finds those records, decides which belong together, and merges or links them so the business counts one customer instead of three. The hard part is not the matching algorithm; it is agreeing what makes two records the same entity, and which version of each attribute survives.

**In practice.** Profile the duplicate rate on the natural key of your most-used dataset before choosing a tool — the number makes the case on its own. Agree the matching rules and survivorship rules with the data owner, run deduplication as a recurring routine rather than a one-off cleanup, and declare the resulting record the source of truth. It is one of the more reliable early wins in a governance program because it is visible and measurable.

**Where it goes wrong.** A cleanup project deduplicates the customer base, everyone celebrates, and the source systems keep creating duplicates at the same rate. Six months later the count is back. Deduplication only stays fixed because of the governance decision that follows it: one authoritative source, and a process at the point of entry that checks before it creates.
