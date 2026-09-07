---
term: Role-based access control
short: Granting access to roles that describe a job, then putting people into roles — so permissions are reviewed and revoked as a set, not one by one.
group: ai
also: RBAC, role-based permissions
related: dynamic-data-masking, sensitive-data, confidential-data, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

RBAC is a governance idea before it is a technical one. Permissions attach to a role — claims adjuster, credit analyst, marketing analyst — the data owner approves what that role may see, and a person receives access by being placed in it. The gain is not fewer clicks; it is that the question changes from "why does Marta have this?" to "should a credit analyst see this?", which is a question someone can actually answer, and answer once for everybody.

**In practice.** Roles are named after jobs, never after people or projects. The data owner approves the role's scope, and access is joined to the HR lifecycle: new starters inherit their role, movers lose the old one on the day they move, and leavers are cut automatically. Sensitive columns stay behind a masking policy even inside an approved role, and every role is recertified on a schedule by the owner who granted it — recertification being the part everybody buys the tool for and nobody runs.

**Where it goes wrong.** Role explosion. Every exception becomes a new role, and after two years there are more roles than employees and no one can say what any of them means, which is functionally the same as having no model at all. The second failure is movers: joiners and leavers get handled, but the person who has changed jobs three times keeps the union of everything they have ever needed. When roles alone cannot express the rule, the answer is usually attributes — region, purpose, classification — layered on top, not another hundred roles.
