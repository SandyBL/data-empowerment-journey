---
term: Data retention
short: The rules for how long each kind of data is kept, what event starts the clock, and what happens to it when the time runs out.
group: ai
also: Retention period, retention policy, retention policies, retention rules, retention schedule, records retention
match: retention periods, retention schedules
related: data-policy, data-classification, personally-identifiable-information, data-privacy, data-management
article: data-governance-vs-data-management
updated: 2026-10-06
---

Data is created, used, goes stale, and should eventually be archived or deleted. Retention is the decision about when. A usable retention rule has three parts: the class of data it covers, a period, and a trigger — the event that starts the clock, such as the end of a contract or the closing of an account. A period without a trigger is a number nobody can apply.

**In practice.** Setting the rule is governance: the owner, with legal and privacy, decides how long customer records are kept and what counts as the end of the relationship. Implementing it is management: the retention job that moves records to archive on the legal schedule and deletes them on time, plus evidence that it ran. Retention also flows downstream. Copies, extracts and training sets inherit the rule of their source, or the rule means very little.

**Where it goes wrong.** Retention is the governance decision most programs defer indefinitely, because keeping everything feels safe and deleting anything feels risky. That is how organizations end up holding personal data for a decade with no defensible basis, and discovering it during an audit or a breach rather than a review.
