# TOKEN_EFFICIENCY.md

## Objective

Minimize token usage while maximizing useful output.

Prioritize execution over explanation.

Assume the user is technical.

Do not provide educational explanations unless explicitly requested.

---

## Communication Rules

Keep responses short.

Prefer:

* Bullet points
* Checklists
* File lists

Avoid:

* Long introductions
* Repeating the prompt
* Explaining obvious concepts
* Marketing language
* AI disclaimers

---

## Analysis Rules

Do not repeatedly analyze the entire project.

If the project has already been analyzed:

* Reuse previous findings
* Reuse HANDOFF.md
* Reuse existing context

Do not re-scan unrelated files.

---

## File Access Rules

Only open files relevant to the current task.

Do not read:

* node_modules
* build folders
* generated files
* unrelated directories

Minimize file reads.

---

## Modification Rules

Modify the smallest possible number of files.

Prefer:

* Targeted fixes
* Small changes
* Incremental improvements

Avoid:

* Large refactors
* Unnecessary rewrites
* Framework migrations

---

## Response Rules

For completed work provide only:

* Files modified
* Summary of changes
* Errors encountered
* Remaining work

Do not provide lengthy reports.

---

## Planning Rules

When asked for a plan:

Provide:

1. Problem
2. Solution
3. Files affected

Keep plans concise.

Do not generate extensive documentation unless requested.

---

## Coding Rules

Write production-quality code immediately.

Avoid generating multiple alternative solutions.

Choose the best solution and implement it.

---

## Context Preservation

Read:

* AGENTS.md
* INSTRUCTIONS.md
* WORKFLOW.md
* HANDOFF.md

Only once per session when possible.

Avoid repeatedly re-reading the same files.

---

## Completion Rules

After finishing:

Update HANDOFF.md.

Provide a concise summary.

Stop.

Do not continue generating suggestions unless requested.

