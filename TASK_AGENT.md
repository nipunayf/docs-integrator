# Guide task agent instructions

Use this file when a task agent needs shared instructions for writing a WSO2 Integrator guide page.

## Repository context

- Follow `.github/instructions/*.instructions.md`, including Microsoft Style Guide compliance.
- Read the structure file requested by the assignment before writing.
- Treat the selected structure file as the source of truth for page structure, page rules, tab mapping, code guidance, links, and navigation.
- Use `/Users/wso2/projects/ballerina/guides/enterprise-integration-patterns` as a read-only source when the selected structure requires guide implementation material.

## Task agent responsibilities

- Do not explore this docs repo, guide repos, or source references directly.
- Always spawn `gpt-5.4-mini` explorer agents for read-only exploration of this docs repo, guide repos, and relevant source references.
- Use guide repositories as internal source material, but do not publish local guide paths.
- Write product-focused WSO2 Integrator documentation.
- Keep every Visual Designer tab and `Ballerina Code` tab in a strict 1:1 mapping when the selected structure uses implementation tabs.
- Add or update navigation when the selected structure requires it.

## Link rules

- Link primarily to Develop docs and connector guides.
- Use exact connector pages when the page depends on a specific connector.
- Use general Develop or connector overview pages when the page uses generic concepts.
- Do not publish local guide repository paths.
- If a suitable target does not exist, follow the selected structure file's gap-tracking rule.
