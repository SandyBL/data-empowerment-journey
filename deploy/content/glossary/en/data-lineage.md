---
term: Data lineage
short: The traceable path a value takes from where it originated to where it is used, including every transformation on the way.
group: metadata
also: Provenance, data flow, impact analysis
related: metadata, data-catalog, single-source-of-truth, data-quality
article: dama-dmbok-data-governance-framework
updated: 2026-09-05
---

Lineage answers two questions that are otherwise expensive. Upstream: this number looks wrong, where did it come from and what touched it. Downstream: we are changing this field, what breaks. The second is impact analysis, and in organizations with any pipeline complexity it is the one that pays for the whole exercise — the alternative is a change freeze or a discovery in production.

**In practice.** Lineage is worth capturing at the granularity you will act on. Table-to-table lineage across the pipelines behind regulatory reports is usually enough to answer both questions; column-level lineage across the entire estate is a research project.

**Where it goes wrong.** Lineage is drawn by hand in a diagramming tool. It is accurate on the day it is drawn and wrong within a sprint, and because it looks authoritative people rely on it after it stops being true. Lineage that is not derived from the pipelines themselves has a shelf life measured in weeks.
