---
term: Sensitive data
short: Data whose exposure harms the person it describes — health, biometrics, beliefs, sexual orientation, criminal records, precise location.
group: ai
also: Special category data, sensitive personal data, dados sensíveis
related: confidential-data, personally-identifiable-information, data-classification, dynamic-data-masking
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

The distinction that matters is who gets hurt. Sensitive data is the category where the damage lands on a human being: a diagnosis, a biometric template, religious or political affiliation, union membership, sexual orientation, ethnicity, a criminal record, an address someone is hiding at. GDPR calls these special categories, Brazil's LGPD calls them dados sensíveis, and both treat them as a separate class with a stricter legal basis — because the consequence of a leak is not embarrassment or a fine, it is discrimination, exclusion, or physical risk to a person who never chose to be in your database.

**In practice.** It is a tag at column level, applied when the data is created and inherited by everything downstream, with masking on by default and access granted for a stated purpose rather than a job title. Retention is shorter, third-party sharing needs a named legal basis, and models trained on it inherit every one of those constraints. The honest first step is usually smaller than a policy: find out which tables actually hold it, because the inventory is almost always wrong.

**Where it goes wrong.** It gets confused with confidential data, and the two are governed as one. Salaries and pricing are confidential — the company is exposed. Health records are sensitive — the individual is exposed. Collapsing them means either protecting commercial data as if lives depended on it, or protecting people's health data with the care you give a price list. Second failure: the tag lives on the source column and the copy in someone's spreadsheet inherits nothing.
