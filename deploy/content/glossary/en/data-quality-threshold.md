---
term: Data quality threshold
short: The line, set by the business, at which a quality measurement stops being acceptable and somebody has to act.
group: quality
also: quality threshold, error threshold, acceptable error threshold, DQ threshold
match: Data quality thresholds
related: data-quality-rule, data-quality-sla, critical-data-element, data-owner, data-quality-dimensions
article: why-data-quality-is-a-business-imperative
updated: 2026-10-06
---

A threshold is the number that turns a measurement into a decision. Completeness of 97% means nothing on its own; completeness below 98% on the billing address field, which stalls invoicing, means the steward gets a ticket. The data owner sets it, because only the business knows how much error a process can absorb before it costs money. Engineering then enforces it, and the steward handles what falls below it.

**In practice.** Set thresholds per use, not per field in the abstract, and start from the consequence: what breaks downstream, and at what rate does it start to hurt? Put the threshold where work already happens — in a pipeline's definition of done, in release criteria — so it is checked every time rather than reviewed once a quarter. Write down why each number was chosen; the reason is what lets someone change it later without a fight.

**Where it goes wrong.** Thresholds are copied from a vendor default or set to 100% because anything less sounds like accepting bad data. A threshold of 100% fires constantly, gets muted, and protects nothing. The opposite failure is a threshold set so loosely it never fires, which looks like good quality on the dashboard and is not.
