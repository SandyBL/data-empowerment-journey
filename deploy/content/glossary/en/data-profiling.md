---
term: Data profiling
short: Examining actual data to learn what is really in it — value distributions, null rates, formats, outliers, relationships.
group: quality
also: Data discovery, data assessment
related: data-quality, data-quality-rule, metadata, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

Profiling is how you find out that the country field contains 47 distinct spellings of "United Kingdom", that 8% of the birth dates are 01/01/1900, and that a column documented as mandatory is empty in a third of rows. It is the cheapest diagnostic in data work and the one most often skipped, because it produces uncomfortable facts before a project has agreed on its scope.

**In practice.** Profile before you promise. Half a day of profiling on the tables behind a proposed dashboard will tell you whether the dashboard is a two-week job or a two-quarter one, and that is the single most useful thing you can know at the start.

**Where it goes wrong.** Profiling output is presented raw. Nobody outside the data team has an opinion about a cardinality report. Translate it: "the customer table has 14,000 duplicate records, which is why the churn rate in the board pack is overstated by roughly four points." Same finding, different consequence.
