---
term: Data lake
short: A central store that holds large volumes of raw data in its original format, to be structured later by whoever uses it.
group: architecture
also: data lakehouse, lakehouse, data swamp
match: Data lakes, data lakehouses, lakehouses
related: data-architecture, data-catalog, metadata, data-owner, data-quality
article: evolution-of-data-why-data-governance-now
updated: 2026-10-06
---

A data lake accepts almost anything: application exports, logs, IoT feeds, SaaS extracts, files nobody remembers requesting. Unlike a warehouse, it does not require a schema up front, which makes it cheap to fill and flexible to use. A lakehouse adds warehouse-style tables and controls on top of the same storage. Either way, the lake solves a storage problem. It does not, by itself, solve any problem of meaning, ownership or trust.

**In practice.** A governed lake looks boring. Each zone or dataset has a named owner, a classification and an entry in the catalog. Raw landing data is kept apart from curated data that people are allowed to report on, and the difference is visible to whoever is browsing. Sensitive columns are masked by default, not after the first complaint.

**Where it goes wrong.** Ingestion runs unmanaged and everything goes in, because it is easy. Within a couple of years the lake holds duplicate records, three versions of the customer table and a storage bill nobody can explain, and analysts quietly go back to their spreadsheets. That is the data swamp, and it is a governance outcome, not a technology one: nobody decided what belonged there or who answered for it.
