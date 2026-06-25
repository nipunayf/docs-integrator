# Shared page rules

These rules apply to every page produced under `en/docs/guides/`. Page-type-specific rules live in `EIP_PATTERN_STRUCTURE.md` and `USE_CASE_STRUCTURE.md`.

1. Read `MISSING_LINKS.md` before writing. Update it when a needed documentation target is missing or too weak.
2. Use the exact product terms **Visual Designer**, **WSO2 Integrator**, **service**, **resource function**, **connector**, and **configurable variable**.
3. Format UI labels in bold; format code identifiers, file names, and expressions in `backticks`.
4. Wrap implementation content in `PatternImplementationTabs` with two `TabItem`s: Visual Designer (`value="ui"`, default) first, then Ballerina Code (`value="code"`). Use these exact labels.
5. Write Visual Designer steps as a numbered list grounded in one concrete source-backed example, linking to the relevant Develop or connector guide. Put connector-specific guidance inside these steps, not in generalized descriptions.
6. Put setup details such as endpoints, credentials, configurable variables, and connector configuration behind relevant Develop or connector guide links instead of adding setup sections.
7. Link supporting product concepts to the relevant docs instead of restating broad documentation.
8. Replace lists of interchangeable examples with the category noun. Enumerate only when each item is materially distinct or constrains the surrounding claim.
9. Do not add `Try it`, `Prerequisites`, `Related patterns`, `Related use cases`, `Key implementation points`, or `Considerations` sections.
10. Do not add testing or run guidance.
11. Do not add Mermaid diagrams by default.
