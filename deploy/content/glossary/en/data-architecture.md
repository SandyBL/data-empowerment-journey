---
term: Data architecture
short: The design of how data is structured, stored, moved and integrated across systems, built to the boundaries and standards that governance decides.
group: architecture
also: Enterprise data architecture
match: data architectures
related: data-governance, data-management, data-domain, single-source-of-truth, data-standard
article: dama-dmbok-data-governance-framework
updated: 2026-10-06
---

Data architecture is the blueprint for the estate: the models, the integration patterns, the platforms and the paths data takes between them. In DMBOK it is one of the knowledge areas around the governance hub, and the division of labor is clean. Governance supplies domain boundaries, the authoritative source for each entity, and the standards. Architecture turns those decisions into models and platform design. It is data management work, not governance work, but it is where governance decisions become physical.

**In practice.** The architecture questions that matter most to governance are rarely about technology. Which system is authoritative for customer? Where does a domain end? Which standard does a new pipeline have to meet before it ships? If those answers exist and are written down, the architects can make good choices quickly. If not, they make the governance decisions themselves, implicitly, one integration at a time.

**Where it goes wrong.** Years of reasonable local choices produce a fragmented estate: legacy mainframes, a cloud lakehouse and a dozen SaaS tools, each with its own overlapping definition of the same entity. Nobody designed the mess. Each piece was sensible when it was added, and no decision ever covered how they fit together. A platform migration does not fix that, because the definitions move across with the data.
