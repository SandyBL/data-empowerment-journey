---
term: Data management
short: The work of building and running the systems, processes, and controls that hold data through its whole life.
group: foundations
also: Enterprise data management, EDM
related: data-governance, master-data-management, dama-dmbok
article: data-governance-vs-data-management
updated: 2026-09-05
---

Data management is the execution work: modeling, integrating, storing, securing, moving, archiving and eventually deleting data. It is what data engineers, DBAs, architects and analysts do. Governance decides the rules; management builds and operates within them. The DAMA-DMBOK treats governance as the hub at the center of eleven management disciplines precisely to keep the two from being confused.

**In practice.** The distinction is easiest to see in a single request. "Customer email should never be blank" is a governance decision — someone with authority over the customer domain declared it. Adding a NOT NULL constraint, backfilling the 40,000 rows that violate it, and monitoring for new violations is data management.

**Where it goes wrong.** Organizations hire data management and call it governance. The platform gets built, the pipelines run, and nobody has decided what the numbers mean, so the same field is loaded three ways for three consumers who each believed theirs was the definition. The reverse failure is quieter and just as common: a governance function that produces policy no engineering team was ever resourced to implement.
