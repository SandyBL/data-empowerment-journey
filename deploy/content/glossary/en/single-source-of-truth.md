---
term: Single source of truth
short: The one place designated as authoritative for a given piece of data, which everything else derives from or defers to.
group: architecture
also: SSOT, golden source, system of record
related: data-product, master-data-management, business-glossary, data-lineage
article: what-data-governance-is-and-is-not
updated: 2026-09-05
---

Usefully understood, this is not one system holding all data. It is a per-attribute decision: the HR system is authoritative for employment status, the CRM for contact preferences, the ERP for the invoiced amount. Everywhere else may hold a copy, but nowhere else may disagree and win. Written down attribute by attribute, this is one of the most valuable artefacts a governance programme produces.

**In practice.** Declare the authoritative source for the twenty attributes that appear in disputed reports, and require downstream systems to reconcile against them. That is a governance decision with a technical consequence, in that order.

**Where it goes wrong.** The phrase becomes a justification for consolidating everything into one platform, which is a multi-year programme with a poor record. You do not need one system; you need one answer per attribute. Those are very different budgets, and only the second one actually resolves the argument in the meeting.
