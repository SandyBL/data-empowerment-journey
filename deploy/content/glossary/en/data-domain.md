---
term: Data domain
short: A bounded subject area of data — customer, product, employee, contract — that one accountable owner can reasonably answer for.
group: architecture
also: Subject area, information domain
related: data-subdomain, data-owner, data-product, data-governance-operating-model
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

A domain is how governance is cut into pieces small enough to own. Customer, product, supplier, employee, finance, contract: each is a body of data with its own definitions, its own systems of record, its own regulatory exposure and its own natural owner somewhere in the business. Domains are the unit almost every operating model is built on, because "who owns the data" is an unanswerable question and "who owns customer data" is not.

**In practice.** Good domains follow the business, not the org chart or the database. They are few — eight to fifteen at enterprise scale — and each has exactly one accountable owner, a system of record, and a list of critical data elements. The test of a boundary is whether a disputed field has an obvious home.

**Where it goes wrong.** Domains get drawn around systems, so "Salesforce data" becomes a domain and the customer record that also lives in billing and support has three owners and no owner. They also get drawn too small: forty domains means forty owners, which means no one is meaningfully accountable and the council cannot fit in a room.
