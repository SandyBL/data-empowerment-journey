---
term: Data product
short: A curated, documented, owned dataset built and maintained for known consumers, with a service level attached.
group: architecture
also: Data as a product
related: data-domain, data-owner, data-catalog, single-source-of-truth
article: building-a-data-governance-operating-model
updated: 2026-09-05
---

Treating data as a product means somebody is accountable for its consumers being satisfied, not merely for the pipeline running. That implies documentation, a stable interface, a declared refresh frequency, quality guarantees, a way to report a problem, and a plan for changing it without breaking downstream users. It is the same discipline a software team applies to an API, applied to a table.

**In practice.** A data product is only a product if it has named consumers. Two teams that depend on it, with an agreed refresh and a route to complain, is enough. Without consumers you have a dataset with extra paperwork.

**Where it goes wrong.** Every existing table gets relabeled a data product with no change in ownership, documentation or commitment. Renaming does not create accountability. The test is simple and unforgiving: if the load fails on a Sunday, does somebody who is not the platform team know, care, and have a stated obligation to respond?
