---
term: Internal data marketplace
short: The place inside the company where teams browse published data products, request access, and get it — with an owner, a contract and a service level attached to each listing.
group: architecture
also: Data marketplace, internal marketplace, data shop
related: data-product, data-catalog, data-contract, external-data-marketplace
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

A catalog tells you the data exists. A marketplace lets you get it. The difference is the checkout: a listing you can request, an approval that routes to the person accountable for it, and access that appears in hours rather than after a quarter of emails. It matters because the alternative is not "people wait" — it is that an analyst who cannot get the certified dataset in a reasonable time rebuilds it badly from a source extract, and now the company has two versions of revenue.

**In practice.** Every listing is a data product, not a table: it has an owner, a description in business language, a contract covering schema and freshness, a visible quality score, usage and cost figures, and a request flow that ends in a granted role rather than a ticket. Consumers can see who else uses it and what changed last month. The measure of whether it works is the median time from request to access, and whether the number is on someone's objectives.

**Where it goes wrong.** The marketplace launches with the entire warehouse dumped into it — ten thousand tables, no owners, no contracts — and it becomes a slower search bar. Or the storefront is real but the request routes into a queue with no service level, which teaches everyone the shortcut is faster. A marketplace with fifty genuinely owned products beats one with everything and nobody behind it.
