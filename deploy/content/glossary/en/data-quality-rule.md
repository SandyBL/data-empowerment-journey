---
term: Data quality rule
short: An executable test on data with a defined threshold and a named owner who acts when it fails.
group: quality
also: DQ check, validation rule, assertion
related: data-quality, data-standard, data-quality-dimensions, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

A rule has four parts: the data it applies to, the condition it asserts, the threshold at which the result counts as a failure, and the person who does something about it. Without the threshold, every rule is either always green or always red. Without the owner, a failing rule is a notification nobody has agreed to receive, which within a month is a filtered email folder.

**In practice.** The rules worth writing come from incidents. Something went wrong, somebody investigated, the cause was a data condition — encode that condition as a rule so the next occurrence is caught before the consequence. A backlog of rules derived from real incidents is credible in a way a generated rule set never is.

**Where it goes wrong.** Rules are generated automatically from profiling results and switched on in bulk. The result is thousands of alerts, most of them describing conditions that are perfectly normal in that business, and the team stops reading any of them. Alert fatigue is not a tuning problem, it is a design decision made too early.
