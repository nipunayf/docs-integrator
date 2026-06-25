# Lessons learned

Use this file to carry explicit feedback across EIP documentation batches.

Only record:

- User-requested improvements.
- Review comments.
- Validation failures.

Do not record inferred preferences, speculative improvements, or unrelated repository observations unless the user or reviewer explicitly asks for them.

## Current operating lessons

- EIP pages must be implementation-focused WSO2 Integrator documentation, not generic pattern explanations.
- The reader is assumed to know the EIP already.
- Use generic pattern scenarios instead of the specific business scenarios from the read-only guide repository.
- Each page must show a 1:1 mapping between **Visual Designer** steps and the `Ballerina Code` tab.
- Do not mention Ballerina in prose except for the tab label `Ballerina Code`.
- Do not add `Try it`, `Prerequisites`, `Related patterns`, `Key implementation points`, or `Considerations` sections.
- Do not add testing or run guidance.
- Put setup needs behind links to Develop or connector guides instead of adding setup sections to EIP pages.
- Prefer local documentation links over external links. Do not add external links unless the user explicitly asks for that external reference.
- Use only relevant code excerpts, not full source files.
- When supporting definitions are useful for a `Ballerina Code` excerpt but are not necessary to explain the pattern, keep them in the source and hide them with `// docs-fold-start: Supporting definitions` and `// docs-fold-end` instead of removing them.
- Add a brief implementation-focused introduction at the top of each pattern page.
- Keep implementation overview descriptions generalized; reserve concrete example details for the Design the integration section.
- Do not include example-specific connector details in generalized descriptions. Put connector-specific guidance and links in the `Visual Designer` steps.
- Keep implementation overview sections concise.
- Implementation overview sections should highlight only high-level WSO2 Integrator concepts for the pattern, not example-specific inputs, values, endpoint paths, formats, payload fields, or other scenario details.
- Do not repeat "in WSO2 Integrator" in EIP page prose when the page context already makes the product clear.
- When linking to Develop documentation for a specific concept, use the exact section anchor instead of the parent page, for example `control-flow#ifelse-statements` and `control-flow#match-expressions`.
- When referencing connector-specific filtering settings such as RabbitMQ binding keys or Kafka topics/partitions, link to the exact connection configuration section in the connections documentation instead of a generic event-artifact page.
- Do not repeat Visual Designer and code terms as alternatives for the same construct in implementation overviews, for example avoid phrasing like "Add an If node or `if` guard"; state the filtering construct once and let the tab group show the UI-to-code mapping.
- Design the integration should use one combined `Visual Designer` and `Ballerina Code` tab group for the pattern flow unless the user explicitly asks for multiple groups.
- The `Ballerina Code` tab should include only source directly relevant to the pattern flow.
- Visual Designer steps should always be grounded by the source for one concrete example instead of listing multiple unsourced alternatives.
- When writing broker-listener steps, use a Kafka consumer example when the available source is Kafka; do not list Kafka, RabbitMQ, and JMS alternatives for that step.
- Message Filter pages must not imply HTTP services are the only input source or that connections are the only outbound channel.
- Message Filter implementation overviews should focus on core filtering constructs: `if`/`else`, query expressions with `where`, listener or resource-level filtering, protocol-native filters, and manual guards in consumer flows.
- Do not include configuration discussion in Message Filter unless it is directly required by the filtering construct being demonstrated.
- Message Filter should not use separate `Implementation overview` or `Design the integration` sections. After the pattern description, add one short abstract paragraph explaining that the pattern is implemented by placing a filtering construct where the integration has enough context to decide whether a message should continue.
- The Message Filter construct-mapping paragraph should contain cross-cutting placement guidance that does not belong in individual concept sections. Distinguish flow-level constructs from boundary or source-level constructs without listing each specific construct used by the sections.
- Message Filter section titles should be based on the concept represented by the construct, not the node or syntax name. For example, use collection-level filtering for query expressions.
- Each Message Filter concept section should include a concise `Visual Designer` and `Ballerina Code` tab pair. The `Visual Designer` tab should give direct step instructions and link to the relevant Develop guide for adding or configuring that construct.
- In Message Filter concept introductions, integrate the construct link into the paragraph naturally. Avoid formulaic trailing sentences such as "This is implemented with if/else statements."
- Message Filter concept introductions should explicitly state when to use the respective filtering logic.
- Message Filter prose must not use the phrase "In WSO2 Integrator".
- Message Filter prose should refer to a "construct", not a "Ballerina construct".
- Message Filter prose should avoid semicolons.
- Message Filter concept sections should include supporting definitions for each filtering case, not only predicate-based filtering.
- Message Filter pages should not include a separate Pattern filtering section.
- Message Filter broker-side delivery examples should use only RabbitMQ unless the user explicitly asks for another broker.
- Message Filter RabbitMQ broker-side delivery prose should reference only RabbitMQ exchange binding configuration, not generic Connections pages or listener queue configuration.
- Use-case guides should keep a structure very similar to their input assignment file, especially the `Use case summary` and `How WSO2 Integrator solves it` sections.
- For the legacy modernization use-case guide, keep the solution approach focused on what Ballerina provides as the solution, not on a generic modernization process.
- For use-case solution approaches, introduce breadth through concrete capability groups. Avoid invented step-by-step frameworks unless the input explicitly provides that structure.
- Avoid long comma-separated capability lists in prose. Break dense examples into shorter sentences or bullets so the reader does not lose the narrative.
- For use-case solution approaches, use a structured narrative that explains how the product addresses the problem, but do not over-condense it so much that key source details are lost.

## Batch notes

- Normalizer: added top introduction, generalized the implementation overview, and kept the concrete example details only in Design the integration.
- Normalizer follow-up: generalized the implementation overview further, collapsed Design the integration into one combined tab group, and reduced the code tab to pattern-relevant source.
- Channel Adapter: created the pattern page from `CHANNEL_ADAPTER_INPUT.md`; navigation wiring in `en/sidebars.ts` remains outside the task write scope.
- Channel Adapter: no Channel Adapter image asset was available, so the page omits `PatternImage`.
- Channel Adapter: npm validation was not run because the EIP task workflow prohibits starting, stopping, installing, building, or testing the docs site.
- Content Based Routing: the task agent reported its required explorer subagent tool was not exposed, so it used local read-only discovery.
- Message Mapper: the task agent reported its required explorer subagent tool was unavailable, so it used narrow read-only shell inspection as a fallback.
