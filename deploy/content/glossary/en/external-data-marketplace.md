---
term: External data marketplace
short: Where data products are exchanged with parties outside the company — as a buyer of third-party data, or as a publisher of your own.
group: architecture
also: Data exchange, commercial data marketplace, third-party data marketplace
related: internal-data-marketplace, data-product, data-contract, data-policy
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Two directions, one set of governance questions. Inbound, you are buying: demographics, firmographics, credit scores, geospatial, weather, market feeds, whether through a broker or a platform exchange like Snowflake Marketplace or AWS Data Exchange. Outbound, you are publishing — sharing with partners, or selling an aggregate that only your company can produce. In both cases data crosses the boundary where your controls end and a contract takes over.

**In practice.** Inbound data gets the same treatment as internal data plus a licence: a named internal owner, a documented provenance, quality checks on arrival, and explicit terms on what you may do with it — whether it may train a model, whether it may be redistributed to a client, what happens to derived data when the subscription ends. Outbound goes nowhere without the DPO and legal on the record: what legal basis covers the sharing, what aggregation or anonymization is applied, and who is accountable when a partner uses it beyond the agreement.

**Where it goes wrong.** A purchased file arrives on a credit card, gets joined into production, and eighteen months later nobody can name its source, its licence or whether the contract still exists — but three regulatory reports depend on it. On the outbound side, the deal is agreed commercially and the privacy review happens after the first delivery, which is the expensive order to do it in.
