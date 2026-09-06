---
term: Data classification
short: Labeling data by how sensitive it is, so that handling rules can be applied automatically rather than remembered.
group: ai
also: Sensitivity classification, information classification
related: personally-identifiable-information, data-policy, ai-governance, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-05
---

A classification scheme is a small set of labels — public, internal, confidential, restricted is the common four — each attached to concrete handling rules: who may access it, whether it may leave the country, whether it may be used to train a model, how long it is kept, how it must be destroyed. The label is only worth having because of the rules behind it; a label with no consequence is decoration.

**In practice.** Four levels is the practical maximum. Every level beyond that produces edge-case arguments and inconsistent tagging, and the difference between "confidential" and "highly confidential" is almost never operationalized differently anyway.

**Where it goes wrong.** Classification is applied by asking data owners to tag everything, which yields the whole estate marked confidential — the safe answer for the person tagging, and useless for everyone else. Anchor the scheme in examples, default to internal, and require a justification for the top level.
