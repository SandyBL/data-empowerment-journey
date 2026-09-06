---
term: Metadata
short: The descriptive layer around a data asset: what it means, where it came from, who owns it, how it may be used.
group: metadata
also: Data about data
related: data-catalog, business-glossary, data-lineage, data-standard
article: introduction-basics-data-governance-program
updated: 2026-09-05
---

Metadata is usually split three ways. Business metadata is meaning — the definition of "active customer", the owner, the sensitivity classification. Technical metadata is structure — table, column, type, nullability, the job that populates it. Operational metadata is behaviour — when the load last ran, how many rows arrived, how many failed validation. A governance programme needs all three, but it only ever has budget to start with one.

**In practice.** Start with business metadata for the data that already appears in decisions, because that is where the absence hurts: an analyst who cannot tell which of two revenue columns is the reported one is losing an hour a week to something a sentence would fix.

**Where it goes wrong.** Metadata is harvested wholesale because a tool can do it automatically, which yields a catalogue of 40,000 technical entries with no meaning attached. Automated harvesting is the cheap half. The expensive half is a human deciding what each thing means, and no tool has ever done that part.
