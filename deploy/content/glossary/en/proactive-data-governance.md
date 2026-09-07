---
term: Proactive data governance
short: Governance built into how data is created and changed, so problems are prevented at the source instead of found downstream.
group: maturity
also: Preventive data governance, governance by design
related: reactive-data-governance, levels-of-maturity, data-contract, data-quality-rule
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Proactive governance means the controls sit where the data is made, not where it is consumed. Definitions are agreed before the table is built. Quality rules run inside the pipeline, so a bad load stops instead of arriving. Interfaces carry a contract, so a breaking change fails the producer's build rather than someone's Monday report. Access is reviewed on a schedule rather than when an auditor asks. Classification happens at creation, when the person who knows what the field contains is still in the room.

**In practice.** It changes what you report. A reactive program counts incidents closed; a proactive one counts things that never happened — loads blocked before publishing, breaking changes caught in CI, access removed on the day someone changed roles, new datasets that arrived with an owner and a classification already attached. Those are leading indicators, they are dull, and they are the only evidence that prevention is working.

**Where it goes wrong.** Prevention curdles into gatekeeping. Every new dataset needs three approvals and a two-week wait, so teams do what people always do when the front door is slow: they build the thing in a spreadsheet, a personal cloud account or a shadow warehouse, and the governance function loses sight of exactly the data it was trying to protect. If a control cannot be automated, it needs a service level — and if it has neither, it is a queue, not a control.
