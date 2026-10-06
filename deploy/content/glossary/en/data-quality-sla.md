---
term: Data quality SLA
short: An explicit commitment from a data-producing team to its consumers about how fresh, complete and accurate a dataset will be, and what happens when it is not.
group: quality
also: quality SLA, data SLA, data quality service level agreement
match: Data quality SLAs
related: data-quality-threshold, data-contract, data-owner, data-observability, data-quality-dimensions
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

A data quality SLA turns "the data should be good" into numbers somebody signs: the customer table lands by 06:00, mandatory fields are at least 99.5% populated, billing accuracy stays above an agreed line. It sits between the team that produces the data and the teams that build on it, and it names an owner on the producing side. Without that name it is a wish with a decimal point.

**In practice.** Start with three dimensions, usually freshness, completeness and accuracy, on the handful of datasets that feed decisions people actually argue about. Each commitment needs a measurement that runs automatically and a response time for breaches, not just a target. The useful SLA is the one a domain owner can see on a dashboard next to whether it was met last month.

**Where it goes wrong.** The SLA is written by the consuming side, promises what they would like rather than what the producer can deliver, and is breached from week one. Nobody renegotiates, everybody stops looking, and the document survives as evidence that quality was once discussed. An SLA that is never breached is usually set too low; one that is always breached is not an agreement.
