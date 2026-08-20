---
title: Building a Data Governance Operating Model That People Actually Use
date: 2026-07-21
updated: 2026-08-20
category: data-governance
summary: A practical guide to turning governance principles into clear
  decisions, useful routines, and measurable business outcomes.
author: Sandy Bradbury
translation_key: building-a-data-governance-operating-model
---

Data governance succeeds when it becomes part of how work gets done—not when it exists only as a policy library. A useful operating model connects strategic intent with the daily decisions made by data owners, stewards, producers, and consumers.

Most governance programmes are not short of intent. They have a charter, a framework diagram, a council with a calendar invite, and a policy set that took months to write. What they lack is the connective tissue: a clear answer to "who decides this, on what evidence, by when" for the handful of questions the organization keeps stalling on. An operating model is that connective tissue, and it is much smaller than the frameworks suggest.

## Start with decisions, not committees

Before designing councils or assigning titles, identify the decisions the organization repeatedly struggles to make. Who can define a critical data element? Who accepts a quality risk? Who resolves conflicts between business definitions?

An operating model should make those decisions faster and more consistent. Every role, forum, and workflow needs a clear reason to exist.

A useful exercise: spend two weeks collecting the questions that got escalated, stalled, or answered inconsistently. You will usually end up with eight to fifteen recurring decisions, and they will cluster. Definitions, access, quality tolerance, retention, and change approval account for most of them. That list — not a maturity model — is the specification for your operating model.

### Map decision rights

Create a lightweight decision map that names the decision, accountable role, required contributors, evidence needed, and escalation path. This removes ambiguity without adding unnecessary bureaucracy.

One row per decision is enough:

| Decision | Accountable | Contributors | Evidence | Escalation |
| --- | --- | --- | --- | --- |
| Change the definition of a critical data element | Domain data owner | Steward, main consuming teams | Impact list of affected reports and models | Data governance council |
| Accept a known quality gap in production | Domain data owner | Steward, engineering, risk | Measured defect rate and business impact | Risk committee |
| Grant access to a restricted dataset | Data owner | Security, privacy | Purpose statement and retention period | CISO |
| Retire a certified metric | Metric owner | Consumers listed on the asset | Usage over the last 90 days | Council |

The value is not the table. It is that the table is short enough to be read, and that every row names a person rather than a body. Committees are good at reviewing decisions and bad at making them; if a row's accountable column contains a forum, the decision will take a month.

## Design governance around real work

Governance gains credibility when it appears inside delivery routines. Add stewardship checks to product planning, quality thresholds to release criteria, and ownership reviews to portfolio governance.

Teams should not need to visit a separate governance universe. The controls should be visible at the moments where they improve an outcome.

In practice this means embedding a small number of checks into rituals that already happen. New data product intake asks for an owner and a classification before it gets a slot. Definition of done for a pipeline includes a quality threshold and an alert route. Quarterly portfolio review shows the count of critical elements without an active owner, alongside the delivery metrics. None of these create a new meeting, which is precisely why they survive.

The counter-example is the standalone governance workflow: a request form, a queue, and a separate review board sitting beside the delivery process. It works while it is new and someone is chasing it, and it decays the moment attention moves. Controls that live inside a process people are already obliged to complete decay much more slowly.

## Decide how much federation you can support

Central, federated, and hybrid models all work; what fails is choosing one that does not match the capacity you have. A federated model asks each domain to supply a real owner with real time. If those people do not exist, federation becomes a diagram in which nobody is accountable.

A workable test is to count the named individuals who can spend a day a week on this. If the answer is two, run centrally, cover the highest-value domains, and expand as you recruit stewards. If the answer is fifteen across the business, federate and keep the centre small — standards, tooling, arbitration, and reporting. Announcing federation before the stewards exist is the most common way an operating model loses credibility in its first quarter.

## Measure adoption and value

Policy completion is not the same as behavior change. Track practical signals: time to resolve data issues, percentage of critical elements with active owners, reuse of approved definitions, and reduction in manual reconciliation.

The strongest measures connect governance activity to a business result such as faster reporting, lower operational risk, or more reliable AI outputs.

Pick no more than five and publish them on the same cadence as the delivery metrics, in the same place. A governance scorecard that lives in its own deck is read by the people who wrote it. One that appears in the operations review is read by the people whose behaviour you are trying to change.

## Build the learning loop

Treat the operating model as a product. Review friction, collect feedback from practitioners, retire controls that do not create value, and improve guidance where teams repeatedly get stuck.

Retirement is the discipline most programmes skip. Controls accumulate, each one justified when it was added, and the aggregate becomes the bureaucracy everyone complains about. A standing rule helps: every control has a named owner and a review date, and at review it must justify itself with evidence of a risk it caught or a decision it accelerated. Controls that cannot are removed, publicly. That single habit does more for governance's reputation than any communications plan.

Governance becomes sustainable when people can see that it helps them make better decisions with less effort.

If the scope of what belongs in this model is still unclear, [Data Governance vs Data Management](/en/blog/data-governance-vs-data-management-key-differences-real-examples/) draws the line, and [What Data Governance Is and What It Is Not](/en/blog/what-data-governance-is-and-what-it-is-not-5-common-misconceptions/) clears out the assumptions that usually distort the design.
