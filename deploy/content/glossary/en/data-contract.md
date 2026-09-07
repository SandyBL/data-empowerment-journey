---
term: Data contract
short: An explicit, versioned agreement between a data producer and its consumers covering schema, meaning, freshness, quality and how change is announced.
group: architecture
also: Data sharing agreement, interface contract, data product contract
related: data-product, data-quality-rule, internal-data-marketplace, data-subdomain
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Most data incidents are not corruption, they are surprise. An engineer renames a column, tightens a type, changes what "cancelled" means, or drops a nightly load to hourly — all reasonable changes — and eleven dashboards and two models downstream break, or worse, keep working and quietly report something else. A data contract makes the promise explicit so the change becomes a negotiation instead of an outage: this is the schema, this is what each field means, this is how fresh it will be, these are the quality thresholds, this is the owner, and this is how much notice you get before any of it changes.

**In practice.** The contract lives with the producer's code, in version control, and it is tested. A breaking change fails the producer's pipeline before it ships, which is the entire point — the cost of the change lands on the team making it rather than on whoever notices first. Consumers register against it, so the producer can see who they would break and deprecation means a date and a migration path rather than an announcement. On a marketplace listing, the contract is what turns a table into something another team can build on.

**Where it goes wrong.** The contract is a page on the wiki. Nothing checks it, it drifts within a month, and it becomes documentation of how the data used to behave. The other failure is over-promising: freshness or completeness the producer has no way to guarantee, so the contract is breached constantly and everyone stops reading the alerts.
