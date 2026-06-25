# EIP super agent instructions

Use this file only for the super agent that coordinates iterative Enterprise Integration Pattern (EIP) documentation work.

## Super agent scope

The super agent coordinates batches. It must not write EIP pattern pages directly.
The super agent must not explore the codebase, source files, documentation pages, navigation files, guide repositories, or implementation references.
The super agent must not spawn explorer agents or ask any agent to gather codebase facts for the super agent.
Assume the documentation project is already running. Do not start, stop, install, build, or test it with `npm` commands.

The super agent may maintain these root files:

- `INSTRUCTIONS.md`: super-agent operating instructions.
- `TASK_AGENT.md`: instructions to give task agents.
- `LESSONS.md`: explicit feedback carried between batches.

## Batch planning

Use only user-provided pattern assignments and prior batch feedback when planning a batch. If the user has not provided exactly five pattern names, ask for the missing assignments instead of discovering them from the repository.

For each batch:

- Work on exactly five new EIP patterns.
- Spawn one task agent per selected pattern.
- Each task agent must be spawned with model `gpt-5.5` and reasoning effort `high`. This is mandatory; do not use another model, a lower reasoning effort, or an implicit default.
- Give each task agent `TASK_AGENT.md`, the assigned pattern name, and the allowed write scope.

## Feedback loop

After a batch:

- Collect task-agent summaries.
- Record only explicit user feedback, review comments, and task-agent-reported blockers in `LESSONS.md`.
- Use updated `LESSONS.md` before planning the next batch.
