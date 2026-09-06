---
term: Personally identifiable information
short: Data that identifies a living person, directly or in combination with other data the holder can reach.
group: ai
also: PII, personal data
related: data-classification, data-policy, ai-governance, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-05
---

PII is broader than most inventories assume, because identifiability is contextual. A postal code is not identifying; a postal code plus a birth date plus a job title frequently is. Under GDPR the relevant concept is personal data, which covers anything relating to an identifiable person, including data that identifies them only when joined to something else you hold. This is why "we removed the names" is not, by itself, anonymization.

**In practice.** Find personal data by tracing purpose rather than scanning columns. Ask which processes involve a person, what was collected, what the person was told at the time, and what basis the organization is relying on. Pattern-matching scanners find email addresses; they do not find the join that makes a dataset re-identifiable.

**Where it goes wrong.** Pseudonymized data is treated as anonymous and moved outside its original controls — into an analytics environment, a test system, a training set. Pseudonymized data is still personal data, because the key that reverses it exists. Anonymous means irreversibly so, and very little data in an operational estate meets that bar.
