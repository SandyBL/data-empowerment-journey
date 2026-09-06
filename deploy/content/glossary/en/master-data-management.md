---
term: Master data management
short: The discipline of maintaining one authoritative record for the entities the whole business shares — customer, product, supplier, employee.
group: metadata
also: MDM, reference data management
related: data-management, single-source-of-truth, data-domain, data-quality
article: data-governance-vs-data-management
updated: 2026-09-05
---

Master data is the data that appears in every system: the customer that exists in CRM, billing, support and the warehouse, in four slightly different versions. MDM is the practice of resolving those into one record with a known identifier, and of deciding which system may change which attribute. It is technical work with a governance prerequisite, because matching rules and survivorship rules are business decisions dressed as configuration.

**In practice.** MDM projects succeed when they start from a specific pain — duplicate customers inflating the churn rate, a supplier paid twice — and cover one entity. They fail when they start from the ambition of a single customer view across the enterprise.

**Where it goes wrong.** The matching threshold is set by the implementation team. Somebody has to decide whether merging two records that are 92% similar is acceptable, and the consequence of a wrong merge is a customer seeing another customer's data. That is an owner's decision, and delegating it to a configuration screen is how MDM becomes a privacy incident.
