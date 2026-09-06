---
slug: simulator-results
nav: boardResults
title: Public Simulator Results and What They Reveal | Data Governance Journey
heading: What the simulator boards reveal about governance instincts
deck: Three scenario simulators, one public leaderboard each, and the lessons that come out of watching people decide under time pressure — plus an honest account of what a public board can and cannot tell you.
description: Public results from three data governance simulators, with the key lessons: how governance instincts fail under pressure, why ownership defaults to IT, and what a leaderboard cannot measure.
kicker: Board results
schema: page
related_articles: building-a-data-governance-operating-model, why-data-governance-people-process-technology-data, data-literacy-is-a-business-capability
updated: 2026-09-05
---

Three simulators on this site put you inside a governance situation and make you choose. A quality rule is failing and fixing it means asking a director to change a process they are measured on. Two departments both claim the customer record. Literacy is low and there is no training budget. You decide, the decision is scored against its governance consequence rather than against a right answer, and your run goes onto a public leaderboard.

This page is what comes out of the other end. Not the leaderboard itself — that is on each simulator — but the distribution behind it, and the lessons that survive being looked at carefully.

It is also an example of the thing it describes. A leaderboard is a measurement, a measurement has a sample size, and a sample size decides which sentences you are allowed to write. So the figures below arrive with their sample size attached, and the wording changes when the sample is too small to carry a percentage.

## What each simulator actually measures

The three are not variations on a quiz. Each one instruments a different failure.

**Data Governance Day-to-Day** scores a week in the life of a governance lead across five axes: efficiency, trust, accountability, security and context. It is scored out of 100. The interesting property is that the five axes are not independent — a decision that buys efficiency usually spends accountability, and the score reflects the trade, so it is very hard to do well by being agreeable.

**Data Ownership Conflict** is ten disputes, each of which belongs to one of three roles: the Business Owner, the Data Steward, or IT. It is scored out of 1000. Four of the ten belong to IT, three to the Steward, and three to the Business Owner — a distribution that matters more than it sounds, and which the next section is about.

**Data Literacy** is fifteen points across governance, analytics, AI and automation, bias awareness and data culture. It is the only one of the three that asks about culture directly, and the only one that produces a second figure — the value it estimates you unlocked from your data assets.

None of the three sees all five [data maturity](/en/glossary/data-maturity/) pillars. Day-to-Day and Ownership are both blind to [data culture](/en/glossary/data-culture/); Literacy is blind to metadata. That is a property of ten-question exercises, not a flaw to be fixed, and it sets the rule the boards are read under: an unmeasured dimension is reported as unmeasured, never as weak. Inferring a culture problem from a RACI exercise would be inventing a finding.

{{PUBLIC_BOARDS}}

## The lessons

### Ownership does not go to whoever should own it, it goes to whoever is nearest the technology

This is the most reliable pattern in the whole set, and the ownership simulator is built to expose it. Ten disputes, scored by role, and the failure is almost never uniform: people are strong on the four IT scenarios and weak on the three that belong to the Business Owner.

Read that carefully, because the useful reading is not "weak at ownership". It is that when a question sounds technical, the answer defaults to the technical team — and most governance questions can be made to sound technical. Who owns the definition of active customer? There is a SQL query behind it, so IT. Who approves sharing data with a third party? There is an API involved, so IT. Who signs off the budget for the warehouse? That one is genuinely IT, which is why the instinct survives.

The consequence is a governance programme where every [data owner](/en/glossary/data-owner/) is in the data team, which means nobody with the authority to change a business process owns anything. It is the single most common structural defect I find in real organisations, and a ten-minute exercise surfaces it in a room in about four minutes.

### The average score tells you almost nothing; the spread tells you where the argument is

A room that averages 70 with everyone between 66 and 74 has a shared model of how governance works. A room that averages 70 by combining a 95 and a 45 has two incompatible models and does not know it. Those two rooms need completely different next quarters, and the average cannot distinguish them.

This is why the figures above report the gap between the best run and the median one, and why the facilitator report for a private session leads with disagreement rather than with the winner. In a workshop the disagreements are the session: the leaderboard goes on the screen, and then the two people who chose opposite things explain themselves to each other using their own organisation as the example.

### Speed is confidence, and confidence is not correctness

Two of the three boards time themselves. On the Data Literacy board so far, the fastest published run is also the lowest-scoring one — twenty-five seconds, five points out of fifteen — while the highest-scoring run took over six minutes.

Three runs is not a finding, and I am not going to pretend it is one. But it matches what happens in rooms consistently enough to be worth saying out loud: the people who finish first are usually the ones who did not notice the trade-off. A governance question that can be answered instantly has usually been misread as a technical question with a lookup answer, which is the same failure as the one above wearing a different hat.

### Governance scores fail on accountability and context, not on security

Everyone knows data needs protecting. Almost nobody can say who decides. Across real sessions, the axes that come back weakest are accountability — who has the authority to make this call — and context, meaning whether anyone downstream can tell what a number actually counts. Security scores comparatively well, because security has budget, a named owner and an audit behind it.

That asymmetry is the argument for an [operating model](/en/glossary/data-governance-operating-model/) rather than more policy. A policy tells people what the rule is. The failures above are failures of [decision rights](/en/glossary/decision-rights/) — nobody was unclear about the rule, they were unclear about who gets to decide the exception.

### A low literacy score is usually a vocabulary problem wearing a numeracy costume

The literacy simulator asks about bias, AI and culture as well as analytics, and the pattern in the answers is that people are not bad at interpreting data — they are unsure what the organisation's words mean. Whether "customer" includes churned accounts. Whether the revenue number is booked or recognised. Whether the dashboard's "active users" is the same "active users" the board saw last week.

That is a [business glossary](/en/glossary/business-glossary/) problem, and it is why [data literacy](/en/glossary/data-literacy/) programmes that teach statistics to people who need definitions do not move anything.

## What a public leaderboard cannot tell you, and why

Everything above is either a property of how the simulators are built or a pattern from running them with real groups. What it is *not* is a diagnosis of any particular organisation — and the reason is worth being precise about, because it is a data governance decision rather than a product limitation.

A public run stores your score, the language you played in, how long you took, and the name you typed. It does not store your per-question breakdown. That is deliberate: keeping the dimension-level detail of a stranger's run would mean this site holds behavioural data on people who came to play a ten-minute exercise, for no purpose it could defend. So it does not keep it.

The consequence is that the public boards can show you how the population of published runs is distributed and nothing about *why* any of it happened. There is no way to say which axis the board is weakest on, because the axis-level data does not exist outside a private space. That is the honest boundary of this page.

## The same instrument, pointed at your organisation

Inside a private space, the breakdown is kept — and that changes what the exercise is. It stops being a leaderboard and becomes a measurement of one specific room.

- **The weakest dimension, ranked first.** Not "your team scored 68", but "your team is weakest on accountability, then context, and it is strong on security" — with the five [data maturity](/en/glossary/data-maturity-model/) pillars each given a reading or explicitly marked as not measured.
- **Where the room disagreed with itself.** The distance between your strongest and weakest run, per exercise, which is the number that tells you whether you have a knowledge gap or a political one.
- **Ownership by role.** The four IT scenarios against the three Business Owner ones, for your people — the finding described above, as a fact about your organisation instead of a general pattern.
- **One attempt per person.** A private space records the first run somebody finishes and refuses the rest, so an average is an average of first instincts rather than of however many tries each person felt like publishing. This is what makes a weak dimension worth acting on.
- **Your scenarios.** The question wording rewritten around your systems, your departments and your vocabulary, so the ownership dispute is between two teams that actually exist and argue.
- **Your branding, your leaderboard.** Your name, logo and accent colour, and a board with only your colleagues on it.

And you keep the report. It ranks the dimensions your group was weakest on, with maturity bands and timings, plus a CSV export — which is the difference between telling a sponsor the team enjoyed the workshop and showing them three ranked areas where your own people did not know who decides.

## Request a private space

Two ways in, depending on how much you already know you want.

**[See how a workshop runs →](/en/workshops/)** — the format, the debrief, which of the three scenarios fits which room, what the facilitator report contains, and how sessions are priced. Start here if you are still deciding whether this fits.

**[Go straight to the contact form →](/en/?offer=private-space#contact-form-start)** — arrives with the private-space request already filled in. Add your dates, the number of participants, the language mix, and which systems and teams the scenarios should name, and I will come back with a scenario recommendation and a quote.

If the workshop is one piece of something larger, [consulting engagements](/en/consulting/) describes how it usually fits — most often as the opening move of an operating model design, because a room that has just argued about ownership will engage with a decision-rights grid in a way that a room that has not never does.
