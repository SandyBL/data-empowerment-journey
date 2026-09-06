---
term: Data standard
short: The specific, testable rule that says how a policy is satisfied — format, allowed values, naming, tolerance.
group: foundations
also: Data naming standard, data specification
related: data-policy, data-quality-rule, business-glossary
article: introduction-basics-data-governance-program
updated: 2026-09-05
---

If a policy says "customer contact details must be usable", the standard says what usable means: email matches a valid format, country code is ISO 3166-1 alpha-2, phone is stored in E.164, address is validated against the postal reference file. A standard is written to be checked by a machine. That is the difference between it and a policy — a policy is a commitment, a standard is a specification.

**In practice.** Standards are where governance stops being abstract, because each one can become a data quality rule with a threshold and a dashboard. The useful sequence is short: name the critical data element, write the standard for it, implement it as a rule, report the breach rate.

**Where it goes wrong.** Standards are written for everything instead of for what matters, which produces a document nobody can implement and a backlog nobody will fund. Twenty standards covering the fields that appear in regulatory reporting and executive dashboards beat two hundred covering every column in the warehouse.
