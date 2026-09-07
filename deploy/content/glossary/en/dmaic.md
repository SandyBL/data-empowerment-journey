---
term: DMAIC
short: The Six Sigma improvement cycle — Define, Measure, Analyze, Improve, Control — used to fix a data quality problem and keep it fixed.
group: quality
also: Define Measure Analyze Improve Control, Six Sigma DMAIC
related: data-quality, data-quality-rule, data-profiling, cost-of-poor-data-quality
article: identifying-addressing-data-pain-points
updated: 2026-09-07
---

Data quality work fails in a predictable way: somebody runs a cleanup, the dashboard turns green, and six months later the same field is broken again because nothing upstream changed. DMAIC is the discipline that prevents that. It comes from manufacturing, it fits data almost unchanged, and its value is entirely in the last letter — Control is the step that separates an improvement from a cleanup.

**In practice.** *Define* picks one critical data element and the business pain attached to it, in money or in hours. *Measure* profiles the current state so there is a baseline, not an opinion. *Analyze* traces the defect to its origin, which is almost always a process or a form rather than a database. *Improve* fixes it where it starts — a required field, a validation, a changed handoff, a retrained team. *Control* leaves behind a quality rule, a monitor, a threshold and a named owner who gets the alert. One cycle per element, six to ten weeks, one page of evidence at each step.

**Where it goes wrong.** Teams stop after Improve, because that is where the visible win is and where the sponsor claps. The other version is a project that spends a quarter in Measure and Analyze, produces a beautiful root-cause deck, and never changes a system.
