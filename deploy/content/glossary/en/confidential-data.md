---
term: Confidential data
short: Data whose exposure harms the organization — pricing, margins, salaries, deal pipelines, source code, customer lists.
group: ai
also: Restricted data, internal confidential, commercially sensitive data
related: sensitive-data, data-classification, role-based-access-control, data-policy
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

Confidential is the level where the company is the one at risk. If it leaks, a competitor prices against you, a negotiation collapses, a valuation moves, or your own people find out what each other earn. That is a real harm and it deserves real controls — but it is a commercial harm, which is why it sits on a different track from sensitive personal data, where a person is the one exposed.

**In practice.** The label is worthless on its own; what makes it useful is the handling rules stapled to it. Who approves access, and for how long. Where it may live — which platform, which region, which tenant. Whether it can leave the company at all, and under what agreement. How long it is kept and what happens at the end. Whether it may be pasted into an external AI tool, which is now the question this classification gets asked most often. If a level has no rules attached, it is decoration.

**Where it goes wrong.** Everything becomes confidential. A default of "restrict it, to be safe" produces a warehouse where 90% of tables carry the top label, so people route around the controls to do their jobs and the label stops carrying information. A workable classification is deliberately lopsided: most data is internal, a slice is confidential, a small set is restricted, and someone senior is willing to defend where the lines fall.
