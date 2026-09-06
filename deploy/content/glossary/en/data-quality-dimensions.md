---
term: Data quality dimensions
short: The standard axes along which data can fail: completeness, accuracy, consistency, timeliness, validity, uniqueness.
group: quality
also: Quality characteristics
related: data-quality, data-quality-rule, data-profiling, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

The dimensions exist so that "the data is bad" becomes a diagnosis. Completeness is whether the value is there. Validity is whether it conforms to its format. Accuracy is whether it matches reality — the only dimension that usually needs a human or an external reference to test. Consistency is whether the same fact agrees across systems. Timeliness is whether it arrived in time to be useful. Uniqueness is whether the entity appears once.

**In practice.** Most real problems are validity, completeness and consistency, in that order, because those are the three a system can create silently. Naming the dimension tells you where the fix belongs: validity is usually an input control, consistency is usually an integration, timeliness is usually a schedule.

**Where it goes wrong.** Accuracy gets measured with a rule, which it cannot be. A postcode that passes format validation and belongs to a different city is valid and wrong. Testing accuracy means comparing against something authoritative, and if no such source exists, say so instead of reporting 98%.
