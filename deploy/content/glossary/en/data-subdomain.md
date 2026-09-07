---
term: Data subdomain
short: A slice inside a data domain with its own steward, its own vocabulary and its own critical data elements.
group: architecture
also: Subdomain, data sub-domain
related: data-domain, data-product, data-owner, data-contract
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

A domain is where accountability sits; a subdomain is where the work actually fits in someone's head. Customer is a domain, and it is far too big for one glossary — prospects, consent and preferences, complaints, credit standing and loyalty each have different definitions of "active", different rules, different systems and different people who care. Splitting Customer into subdomains lets each of those be owned properly without inventing five new domains and five new owners on the org chart.

**In practice.** You know you need one when a single steward cannot answer questions across the domain, or when the same word needs two definitions inside it. A subdomain gets a named steward, its own entries in the business glossary, its own critical data elements and quality rules, and it is usually the unit that data products are actually built and published from. The domain owner still owns the whole; the subdomain steward runs a part of it.

**Where it goes wrong.** Subdividing until the catalog is a copy of the reporting structure. Fifty subdomains means fifty half-maintained glossaries, and the reorganization that arrives next year invalidates all of them. Split when a definition or an owner forces you to, not to make the diagram look complete.
