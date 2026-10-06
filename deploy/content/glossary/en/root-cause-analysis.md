---
term: Root cause analysis
short: Tracing a data defect back past the symptom to the process, system or decision that produces it, so the fix stops it recurring.
group: quality
also: RCA, root-cause analysis, root cause, root-cause remediation, 5 Whys, five whys
related: dmaic, data-quality, data-quality-rule, data-profiling, data-lineage
article: identifying-addressing-data-pain-points
updated: 2026-10-06
---

A broken field is a symptom. The cause is almost always upstream of the database: a form that accepts free text, a handover between teams that nobody owns, an integration that silently truncates, a target that rewards entering anything to close the ticket. Root cause analysis is the discipline of asking why until you reach something a person or a process change can fix. The 5 Whys is the usual tool and lineage is the map you follow. It is the Analyze step in DMAIC, and the step that turns a cleanup into an improvement.

**In practice.** Start from the escalations, not from a framework. Pull a year of incidents, tickets and audit findings and code them by cause; most organizations find that four or five causes account for the majority, and that at least one has been recurring for years without an owner. Each confirmed cause should end in two things: a fix where the defect originates, and a data quality rule that catches the next occurrence.

**Where it goes wrong.** The analysis stops at the first technical answer — "the ETL job failed" — which is where blame is easiest to place and least useful. Or it runs for a quarter, produces a beautiful cause-and-effect diagram and changes no system. An analysis that does not change a process has only documented the problem more thoroughly.
