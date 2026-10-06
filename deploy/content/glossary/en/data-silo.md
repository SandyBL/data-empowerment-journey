---
term: Data silo
short: A copy of shared data held by one team or system, cut off from the rest of the organization and slowly diverging from every other copy.
group: architecture
also: siloed data, information silo
match: Data silos, information silos
related: single-source-of-truth, shadow-spreadsheet, master-data-management, data-catalog, data-domain
article: evolution-of-data-why-data-governance-now
updated: 2026-10-06
---

A silo forms when getting shared information centrally was, at some point, harder than rebuilding it locally. Sales has its customer list, finance has another, the warehouse team has a third. Nobody set out to create one; each was a reasonable shortcut. The visible cost is duplicated effort. The expensive cost is that the copies diverge, three dashboards show three answers to the same question, and nobody can say which one is right.

**In practice.** The governance response is not "consolidate everything" — that is a multi-year platform program, not a governance act. It is to name the authoritative source for each shared entity, declare the other copies derived, and publish that decision somewhere people will actually find it. A data catalog helps. The decision matters more than the tool.

**Where it goes wrong.** Silos are treated as a technology problem and answered with a migration. The data moves to one platform, the definitions move with it unchanged, and the organization now has the same silos in a single, more expensive location. A silo is ended by a decision about authority, not by a change of address.
