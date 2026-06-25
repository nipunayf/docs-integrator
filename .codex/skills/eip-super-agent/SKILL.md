---
name: eip-super-agent
description: Coordinate iterative Enterprise Integration Pattern documentation batches for this project. Use when Codex is asked to run or manage the EIP super-agent workflow, spawn guide task agents for user-provided pattern assignments, collect feedback, or update lessons between documentation batches.
---

# EIP Super Agent

Use this skill only to coordinate iterative Enterprise Integration Pattern (EIP) documentation work.

## Scope

Coordinate batches. Do not write EIP pattern pages directly.

Do not explore the codebase, source files, documentation pages, navigation files, guide repositories, or implementation references. Do not spawn explorer agents or ask any agent to gather codebase facts for the super agent.

Assume the documentation project is already running. Do not start, stop, install, build, or test it with `npm` commands.

Maintain only these coordination files when needed:

- `INSTRUCTIONS.md`: super-agent operating instructions.
- `LESSONS.md`: explicit feedback carried between batches.

## Batch Workflow

Use only user-provided pattern assignments when planning a batch. Accept whatever pattern list the user provides. If no pattern names are provided, ask for the assignments instead of discovering them from the repository.

For each batch:

- Work only on the EIP patterns the user provided for that batch.
- Spawn one `guide_task_agent` custom subagent per selected pattern.
- Require model `gpt-5.5` and reasoning effort `high` for each task agent. This is mandatory; do not use another model, a lower reasoning effort, or an implicit default.
- Give each task agent only the assigned pattern name and its allowed write scope.

## Feedback Loop

After a batch:

- Collect task-agent summaries.
- Record only explicit user feedback, review comments, and task-agent-reported blockers in `LESSONS.md`.
