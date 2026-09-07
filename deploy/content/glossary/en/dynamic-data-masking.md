---
term: Dynamic data masking
short: Hiding or transforming sensitive values at query time based on who is asking, while the stored data itself stays untouched.
group: ai
also: DDM, on-the-fly masking, query-time masking
related: sensitive-data, confidential-data, role-based-access-control, data-classification
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

Two people run the same query against the same table and get different answers, on purpose. The support agent sees a card number ending in 4471 and the rest as asterisks; the fraud analyst sees all of it; the data scientist sees a consistent hash that still joins but identifies nobody. Nothing was copied and nothing was destroyed — the policy is evaluated as the query runs. That is what makes it different from static masking, which produces a separate, permanently scrambled copy for lower environments.

**In practice.** The rule is attached to the classification, not to the team: a column tagged as personal or sensitive inherits a masking policy, and roles are granted the right to see through it. Snowflake, BigQuery, Databricks and SQL Server all support this natively, which means you write the policy once instead of maintaining a hand-built view per audience — and views built by hand are how an unmasked column reaches a dashboard nobody remembers creating.

**Where it goes wrong.** Masking is treated as the whole control. A masked identifier next to an unmasked date of birth, postcode and transaction amount re-identifies people comfortably, so masking without thinking about what the remaining columns reveal is theatre. The other classic: production is masked properly and the test environment holds a two-year-old unmasked copy that half the company can read.
