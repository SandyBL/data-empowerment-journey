---
term: Data privacy
short: The discipline of making sure personal data is collected, used and shared only for purposes the person can expect and the law allows.
group: ai
also: Information privacy, data protection, personal data protection, privacy by design, privacy controls
related: personally-identifiable-information, sensitive-data, data-classification, dynamic-data-masking, ai-governance
article: responsible-ai-starts-with-data-governance
updated: 2026-10-06
---

Privacy is about the person in the data, not the organization holding it. Security asks whether the data is protected from people who should not see it. Privacy asks whether the people who can see it should be using it for this. Regulations such as GDPR, LGPD and CCPA turn that question into obligations: a legal basis, a declared purpose, minimization, retention limits and rights the person can exercise.

**In practice.** Privacy connects to classification and access. Personal fields are tagged where they are created, masked by default, and released for a stated purpose rather than for a job title. Purpose tagging does most of the work: a dataset collected for billing does not automatically become available for a churn model, and a training set inherits the consent and purpose limits of every source that fed it.

**Where it goes wrong.** Privacy is handled as a legal document instead of a set of controls. The policy says data is used only for declared purposes; nothing in the catalog records what those purposes were. Then a model goes into production and nobody can say whether the customers in it consented to this use. The policy was never wrong. It just had nothing underneath it.
