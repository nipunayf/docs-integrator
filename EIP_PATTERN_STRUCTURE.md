# EIP pattern structure

Use this structure for every new Enterprise Integration Pattern (EIP) page.

```md
---
title: <Pattern name>
description: "Implement the <pattern name> pattern with WSO2 Integrator."
---

import TabItem from '@theme/TabItem';
import {
  EipReferenceLink,
  PatternImplementationTabs,
  PatternImage,
} from '@site/src/utils/eipPatternComponents';

# <Pattern name>

<Brief implementation-focused intro. Assume the reader already knows the pattern. State what the pattern controls in an integration flow.> <EipReferenceLink href="<EIP reference URL>" label="Enterprise Integration Patterns <pattern name> reference" />

<One short abstract paragraph explaining where the pattern is implemented in the integration. Keep this generalized.>

## <Implementation concept>

<Concise concept introduction. Explain when to use this implementation approach and link naturally to the exact Develop or connector guide section for the construct.>

<Brief example description in a new paragraph. Give enough context to explain what the example is about and what the implementation demonstrates.>

<PatternImplementationTabs>
<TabItem value="ui" label="Visual Designer" default>

1. <Direct Visual Designer step.>
2. <Direct Visual Designer step.>
3. <Direct Visual Designer step.>

<PatternImage
  src="/img/tutorials/patterns/<image-name>.png"
  alt="<Short descriptive alt text>"
  width={560}
/>

</TabItem>
<TabItem value="code" label="Ballerina Code">

<Only the relevant matching code excerpt.>

</TabItem>
</PatternImplementationTabs>

## <Next implementation concept>

<Repeat the same compact concept and tab pair structure.>
```

## Page rules

See `PAGE_RULES.md` for shared rules. The rules below are specific to EIP pattern pages:

1. Publish the page under `en/docs/guides/patterns/` and add it to the Enterprise integration patterns section in `en/sidebars.ts`.
2. Use a generic pattern scenario, not the specific business scenario from the guide repository.
3. Keep the top explanation abstract and placement-focused. Keep concrete scenario details inside the relevant implementation concept section.
4. Add a brief example description paragraph before each implementation tab pair, explaining what the example is about and what it demonstrates.
5. Name H2 sections by implementation concept, not by UI node or source syntax. Use one concept section for patterns with one main implementation path, and multiple concept sections for patterns with multiple valid approaches.
6. Every implementation concept section must have both Visual Designer and Ballerina Code tabs. The code tab must map 1:1 to the Visual Designer steps for that concept.
7. If a step cannot be represented in both tabs, include it as part of a broader concept section instead of making it a separate section.
8. Group structurally identical target invocations in one concept section; use separate concept sections when target invocations have distinct logic.
