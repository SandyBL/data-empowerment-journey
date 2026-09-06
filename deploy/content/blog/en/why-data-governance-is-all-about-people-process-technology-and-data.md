---
title: Why Data Governance Is All About People, Process, Technology… and Data
date: 2026-09-02
updated: 2026-09-05
category: data-governance
summary: Explore the Golden Square of enterprise Data Governance (People,
  Process, Technology and Data) and learn how aligning these four pillars
  creates a sustainable competitive advantage.
author: Sandy Bradbury
translation_key: why-data-governance-people-process-technology-data
---

Management consulting has leaned on *people, process, technology* for decades, and it is a genuinely useful triad. Applied to data work it is also incomplete, because it treats the thing being governed as a given. Add the fourth corner and you get what I have come to call the Golden Square: people, process, technology, and data.

The value of the model is not descriptive. It is diagnostic. Nearly every stalled [data governance](/en/glossary/data-governance/) program I have been asked to look at was strong in two corners, adequate in one, and empty in the fourth — and the empty corner was reliably the reason for the stall. So this piece covers what each corner actually contains, and more usefully, what failure looks like when one of them is missing.

## People: authority, capacity, and culture

Governance is enacted by people, and the corner has three distinct requirements that organizations habitually conflate.

**Authority.** Someone must be able to make a decision that holds. That means a [data owner](/en/glossary/data-owner/) per [data domain](/en/glossary/data-domain/) who is senior enough that their approval of a definition is not relitigated by a peer next month.

**Capacity.** Someone must have hours available to do the work — the definitional grind, the defect investigation, the answering of questions. This is the [data stewardship](/en/glossary/data-stewardship/) function, and it is the single most commonly under-resourced part of any governance program. Half a day a week, agreed by the steward's own manager, is worth more than any amount of nominal commitment.

**Culture.** Enough people must understand why the controls exist to comply without being chased. That is a [data literacy](/en/glossary/data-literacy/) question, and it determines whether governance is experienced as help or as obstruction.

The three are independent, which is why partial investment produces so little. An owner with authority and no capacity approves things slowly and stops attending. A steward with capacity and no owner above them produces excellent documentation nobody ratifies. And both of them working inside a culture that has not been told why any of it matters spend their week negotiating instead of deciding.

## Process: the routines that carry decisions

Process is what turns a governance intention into something that happens on a Tuesday whether or not anyone remembers to.

The core routines are few: how a definition gets proposed, reviewed, and approved; how a quality defect is raised, triaged, and closed; how access is requested and decided; how a change to a shared asset is assessed for impact; and how ownership is reconfirmed after a reorganization.

The design principle that matters more than any of the specifics: embed these inside routines that already exist rather than creating parallel ones. A quality threshold in the definition of done for a pipeline survives. A separate governance review board beside the delivery process works while someone is chasing it and decays the moment attention moves.

| Process element | What it produces | Where it should live |
| :--- | :--- | :--- |
| Definition approval | One authoritative meaning per business term | The [business glossary](/en/glossary/business-glossary/), maintained by stewards |
| Quality issue handling | Triage, accountability, and closure | The existing incident or ticket queue |
| Access decisions | A yes or no inside a service level | Standing rules per classification tier |
| Change impact review | Known downstream consequences before a change | Existing release and change management |
| Ownership reconfirmation | No orphaned domains after a restructure | Quarterly, alongside portfolio review |

## Technology: the enabler, not the program

Technology makes governance cheap to sustain and impossible to start. That ordering matters, because the corner is where most budget goes first.

What the tooling genuinely does: a [data catalog](/en/glossary/data-catalog/) makes definitions and ownership findable; quality engines measure [data quality rules](/en/glossary/data-quality-rule/) on a schedule and route alerts; [lineage](/en/glossary/data-lineage/) capture answers "what breaks if I change this"; access platforms enforce the role model; workflow tools remove the chasing from approvals.

What it does not do is decide anything. A catalog will hold four contradictory definitions of revenue without complaint, because it has no view on which is right and no authority to make one binding. Technology accelerates whatever process you already have — including a bad one. Automating an unowned, undefined estate produces chaos faster and with better logging.

There is a defensible sequence here. Buy tooling when the manual overhead of a working process is the binding constraint — not before. That usually means year two, and it means you arrive at the procurement conversation knowing what you need the tool to do, which is worth more than any amount of comparative evaluation.

## Data: the corner the classic triad forgets

The fourth corner is the asset itself, and adding it changes the analysis in three specific ways.

It forces you to be selective. Not all data warrants governance. Identifying [critical data elements](/en/glossary/critical-data-element/) — the attributes whose failure causes visible business harm — is what keeps a program proportionate. Organizations that skip this step govern everything shallowly instead of something properly.

It forces you to account for shape. Structured records in a warehouse, semi-structured logs and event streams, and unstructured documents, contracts, and media all need governance, and the controls do not transfer between them. A classification scheme designed for database columns applied to a document store produces a policy that cannot be enforced.

And it forces you to think about lifecycle. Data is created, used, becomes stale, and should eventually be archived or deleted. Retention with an actual trigger is a governance decision that most programs defer indefinitely, which is how organizations end up holding personal data for eleven years with no defensible basis.

## What failure looks like in each corner

This is the diagnostic value of the model.

**Weak people, everything else strong.** You have a platform, documented processes, and a clear critical element list — and no named owner with authority. Definitions get proposed and never approved. Quality alerts fire to a distribution list. Everything is ready to work and nothing decides. This is the most common failure, and the cheapest to fix, because naming owners costs a decision rather than a budget.

**Weak process, everything else strong.** Capable people, good tooling, clear priorities, and every governance act is a heroic individual effort. It works while those individuals are present and disappears when they change roles. The symptom is a program whose output correlates suspiciously well with one person's calendar.

**Weak technology, everything else strong.** Owners, routines, and a critical element list, all operated on spreadsheets and goodwill. This one actually works, up to a point — it is how I would start any first-year program. It breaks on scale: at somewhere around a hundred assets or a few dozen rules, the manual overhead exceeds the capacity you have, and stewards start skipping the parts nobody checks.

**Weak data corner, everything else strong.** A well-staffed, well-tooled, well-organized function governing everything at once with no prioritization. Enormous activity, no visible outcome, and a steward population slowly burning out documenting fields nobody reads. The remedy is a critical element list and the willingness to leave things ungoverned on purpose.

## Finding your constraint

Score each corner honestly, one to five, and act on the lowest.

For **people**, ask: can you name the accountable individual for your top five domains in under a minute, and does each of them have someone with actual hours to do the work?

For **process**, ask: if the two most engaged people in your governance function left next month, which routines would still happen?

For **technology**, ask: is the manual effort in your governance routines currently the binding constraint, or is it the absence of decisions? Only buy when the honest answer is the first one.

For **data**, ask: can you produce the list of attributes whose failure causes visible business harm, and is it short enough to actually govern?

The lowest score is your next investment, and it is very often not the one with a vendor attached. If you want a structured version of this diagnostic across the same dimensions, the [maturity assessment](/en/maturity-assessment/) covers all four, and the [cost of bad data calculator](/en/calculator/) will help you put a figure on what the weakest corner is currently costing.

## The point of alignment

None of the four corners produces value on its own. People without process are heroic and unrepeatable. Process without technology is sustainable only at small scale. Technology without people automates an undefined estate. And all three without a clear view of which data matters produce a great deal of well-governed irrelevance.

When they align, governance stops being a thing that is done to teams and becomes the reason their decisions are faster and their numbers agree. That is the whole ambition, and it is more achievable than the frameworks make it look.

For the mechanics of the people and process corners specifically, [Building a Data Governance Operating Model](/en/blog/building-a-data-governance-operating-model/) covers how decision rights become working routines, and [Introduction to the Basics of a Data Governance Program](/en/blog/introduction-to-the-basics-of-a-data-governance-program/) sets out the foundations in the order I would build them.
