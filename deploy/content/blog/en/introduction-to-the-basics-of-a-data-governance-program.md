---
title: Introduction to the Basics of a Data Governance Program
date: 2026-09-01
updated: 2026-09-05
category: data-governance
summary: Learn the 6 foundational building blocks needed to launch a pragmatic
  Data Governance Program that turns raw data into a trusted enterprise asset.
author: Sandy Bradbury
translation_key: introduction-basics-data-governance-program
---

Most people who ask me how to start a data governance program have already read enough to be intimidated. They have seen the [DMBOK](/en/glossary/dama-dmbok/) wheel with its eleven knowledge areas, a maturity model with five levels and forty sub-dimensions, and a vendor deck promising an enterprise data fabric. None of that is wrong. All of it is the wrong place to start.

A first governance program is small. It consists of six foundations, none of which requires a platform, and it can be stood up by one determined person with executive backing and a few hours a week from the right five colleagues. What follows is those six foundations, the order I would build them in, and what to deliberately leave until year two.

## 1. Treat data as an asset — and mean something by it

"Data is an asset" is the most repeated sentence in this field and usually the emptiest. It becomes real only when it changes a decision, so here is the test: an asset has an owner, a recorded value, a maintenance cost, and a lifecycle that ends.

Applied to data, that means somebody is accountable for each significant dataset. It means you can say roughly what it is worth to the business and what it costs you when it is wrong — if you have never put a figure to that, the [cost of bad data calculator](/en/calculator/) is a defensible starting estimate. And it means data gets retired: archived or deleted when it no longer serves a purpose, rather than accumulating in storage forever because deleting things feels risky.

If your organization can answer "who owns this, what is it worth, what does it cost us, when does it go away" for its top ten datasets, it treats data as an asset. If it cannot, the slogan is decoration.

## 2. Organize data into domains

Governing "all enterprise data" is not a scope; it is a wish. Cut the estate into [data domains](/en/glossary/data-domain/) — coherent areas of data with a natural business owner — and govern them one at a time.

There are three common cuts, and most organizations end up using a mix:

| Domain type | Organizing principle | Examples |
| :--- | :--- | :--- |
| Business function | Who produces and uses the data | Finance, HR, Marketing, Operations |
| Master data | Shared entities used across functions | Customer, Product, Vendor, Employee |
| Process | End-to-end operational flows | Order-to-cash, Procure-to-pay, Onboarding |

The practical guidance is to keep the number small at the start — five to eight domains, not thirty — and to define each one by the entities it contains rather than by the systems that hold them. A domain defined by a system becomes obsolete the moment you migrate.

Then pick two to start with. Choose the ones that appear most often in your escalations, not the ones that are easiest.

## 3. Define roles, and name actual people

Three roles carry a first program.

**[Data owners](/en/glossary/data-owner/)** are accountable for a domain: they approve definitions, accept quality risk, and decide access. They need to be senior enough that their decisions hold and close enough to the business to know what the data means. One person, not a committee.

**[Data stewards](/en/glossary/data-steward/)** do the work: maintaining definitions, investigating quality issues, coordinating fixes, answering questions about what a field means. This is where most of the actual hours go, and it is the role programs most often forget to staff. An owner without a steward is an accountable person with no capacity to act.

**A small coordinating function** — one person is enough at first — keeps the standards, runs the forum, chases the follow-ups, and publishes the measures.

The single most useful thing you can do in week one is convert every role on your diagram into a name. Roles nobody occupies are the most common reason governance programs look complete on paper and produce nothing.

One more thing about naming people: get their manager to agree in writing to the time commitment. Stewardship performed on top of a full workload is the most common way a governance program quietly dies — not through opposition, but because the steward's day job has deadlines and governance does not. Half a day a week, agreed by the person who sets their priorities, outlasts any amount of enthusiasm.

## 4. Write a policy set small enough to read

New programs tend to write too much policy too early. Aim for the smallest set that covers your actual exposure, and write each one so that a breach would be visible.

For most organizations that means five or six [data policies](/en/glossary/data-policy/): classification and handling of sensitive data, access approval, retention, quality expectations for [critical data elements](/en/glossary/critical-data-element/), and definitional authority — who may approve the meaning of a business term.

Two habits keep a policy set alive. Give every policy a named owner and a review date. And write the rule in a form that can be checked: not "data must be accurate", but "customer email is mandatory on active accounts, measured weekly, and any month below 98% is accepted in writing by the domain owner or remediated."

## 5. Build the simplest inventory that works

You need to know what you have. That is all a [data catalog](/en/glossary/data-catalog/) is for at this stage, and a spreadsheet does it adequately for the first hundred assets.

Record, per significant dataset: what it is, who owns it, its classification, its source system, its refresh schedule, and the definitions of its key fields. Start with the datasets that feed your executive reporting, because those are the ones whose failures get noticed.

Buy the tool when the spreadsheet becomes the bottleneck, and not before. A catalog product bought before there is anything to put in it produces an empty index and a license renewal conversation. If you want a starting structure, the [templates](/en/templates/) include an inventory and a definitions register you can copy.

## 6. Fix a small amount of data quality visibly

[Data quality](/en/glossary/data-quality/) is where governance either earns trust or loses it, and the mistake is to start broad. Measuring forty attributes across nine systems produces a dashboard; fixing three attributes that people complain about weekly produces a reputation.

Pick your critical data elements — the handful of fields that, when wrong, cause a visible business problem. Set a tolerance for each, decide who accepts the risk when it is breached, implement a [data quality rule](/en/glossary/data-quality-rule/) that measures it on a schedule, and route the alert to a person rather than an inbox. Then publish the trend where the business already looks.

One reliable early win: deduplication on a core entity with a [single source of truth](/en/glossary/single-source-of-truth/) declared afterward. It is visible, it is measurable, and it stays fixed only because of the governance decision that followed it.

A note on where to publish quality results. The instinct is to build a governance dashboard, and the problem with a governance dashboard is that it is read by the people who built it. If completeness on customer email is a business metric, it belongs in the operations review next to the other business metrics. That placement does more for adoption than any communications plan.

## The order matters

The six foundations are not independent, and building them out of sequence is the usual cause of stalled programs.

Domains before roles, because you cannot name an owner for an undefined scope. Roles before policy, because a policy with no owner is documentation. Policy before catalog, because the catalog records decisions and you need to have made some. Catalog before quality measurement, because you cannot measure what you have not inventoried, and you will otherwise measure whatever happens to be convenient.

If you take nothing else from this: two domains, named owners and stewards, five policies, one spreadsheet, three measured attributes. That is a complete first-quarter program, and it is enough to demonstrate value.

## What to leave until year two

Being explicit about what you are *not* doing is what keeps a first program deliverable.

Leave the platform purchase. Leave the full maturity assessment against every dimension — one read to find your weakest area is useful, a forty-item scored baseline is a project in itself. Leave federation: run centrally over two domains until you have stewards who exist. Leave the enterprise-wide glossary; do the fifty terms that appear in board reporting. And leave the multi-year roadmap, which will be wrong, in favor of a published plan for the next two quarters, which will be roughly right and can be believed.

## Getting started this week

Three questions, answerable in an afternoon: what are our five domains, who is the accountable person for the two that hurt most, and what three attributes would we fix first if someone gave us two weeks?

If the answers are unclear, that is your diagnostic, and [Identifying and Addressing Data Pain Points](/en/blog/identifying-and-addressing-data-pain-points-the-first-step-in-data-governance/) is the method for finding them. When the foundations are in place and you need decisions to start flowing through them, [Building a Data Governance Operating Model](/en/blog/building-a-data-governance-operating-model/) is the next step. And if you want a structured read on where you stand before committing to any of it, the [maturity assessment](/en/maturity-assessment/) takes about ten minutes.
