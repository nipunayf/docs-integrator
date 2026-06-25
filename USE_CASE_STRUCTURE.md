# Integration use case structure

Every use case page tells the same five-beat story: set the **Situation** the reader operates in, sharpen it into the **Problem** they cannot solve today, pivot to the toolchain, lay out the **Solution** as themed sections that build the reader's mental model, name the **Outcome** in concrete terms, then show one **Scenario** end-to-end. The template below structures these beats; the rules apply to the page as a whole.

## Template

````markdown
---
title: <Use case name>
description: "<Short outcome-focused description.>"
---

import TabItem from '@theme/TabItem';
import {
  PatternImplementationTabs,
} from '@site/src/utils/eipPatternComponents';

# <Use case name>

<!-- Situation: the reader's world. Describe the kinds of business units, the classes of system they run, and the core entities each system manages. Use generic roles (sales, finance, operations) and system classes (CRM, ERP, billing system) — no product or tool names. -->

<Situation paragraph(s).>

<!-- Problem: sharpen the situation into the gap. Explain how the data, events, or work items are siloed, duplicated, delayed, or inconsistent across these systems; why manual or point-to-point fixes fail; and the specific business consequences this creates. Still no product or tool names. -->

<Problem paragraph(s).>

<!-- Pivot: bridge from the reader's world to the toolchain. This is the page's hinge: above it the reader sees their problem; below it they see how WSO2 Integrator and Ballerina address it. Spend as many words as the bridge needs — name what the toolchain is and why it fits this class of problem. From this point on, product and package names are fair game. -->

<Pivot prose.>

<!-- Solution: break into themed `##` headings drawn from the source. Themes build the reader's mental model of how the toolchain addresses this class of problem — they are not a catalog of features grouped by connector type. Use as many themes as the message requires; stop when the mental model is complete. -->

## <Theme heading 1>

<Source-grounded prose. For each capability the source surfaces, answer: what does it do for this class of problem, and where does it sit in the integration. No code, no scenario-specific steps, no invented process frameworks, no comma-separated feature lists.>

## <Theme heading 2>

<Source-grounded prose for this theme.>

## Outcome

<Name the concrete shifts the solution produces, in terms a developer or operator can verify: which downstream jobs disappear, which consumers onboard against a single contract, which failure modes become observable in one place, which manual reconciliation steps drop out. Avoid exec-summary phrasing ("drives better business outcomes"); state what changes in the system and for whom.>

## Scenario: <Concrete scenario name>

<One concrete instance of the themed territory above. State the source system, target system, trigger, message or data exchanged, and expected result. Include setup details only when they support the implementation steps below.>

<PatternImplementationTabs>
<TabItem value="ui" label="Visual Designer" default>

1. <Direct Visual Designer step grounded in the scenario. UI labels in **bold**, code identifiers in `backticks`. Link to the relevant Develop or connector guide.>
2. <Continue with as many steps as the scenario requires.>

</TabItem>
<TabItem value="code" label="Ballerina Code">

```ballerina
<Complete-enough Ballerina source for the scenario, using only packages and features from the research report.>
```

</TabItem>
</PatternImplementationTabs>
````

## Page rules

See `PAGE_RULES.md` for shared rules. The rules below are specific to integration use case pages:

1. Publish the page under `en/docs/guides/use-cases/` and add it to the Integration use cases section in `en/sidebars.ts`.
2. Use the input document as the source, but reorder and condense for a coherent page narrative. State each idea once, in the section where it best supports the narrative.
3. Use one concrete scenario per page.
4. In the **Situation** and **Problem** paragraphs (before the pivot), do not use product or tool names. Refer to system classes and roles only.
5. The **pivot** introduces WSO2 Integrator and Ballerina and explains why the toolchain fits this class of problem. Length follows the message — be as long as the bridge requires and no longer. From the pivot onward, product, package, and connector names are fair game.
6. Across the themed **Solution** sections, preserve key source capabilities as flowing prose. Avoid long comma-separated capability lists, invented step-by-step frameworks, code, and example-specific connector details. Do not carry over architectural gap or limitation sections from the source.
7. The **Outcome** section names verifiable shifts (jobs removed, contracts unified, failures made observable, manual steps dropped). It is not a benefits blurb and does not name a specific customer.
8. If the scenario needs a step the Visual Designer cannot support, keep the Visual Designer steps first, add the CLI or source-level step only where required, and record the gap in `MISSING_LINKS.md`.
9. In the Ballerina Code tab, provide complete-enough source for the scenario, using only packages and features present in the research report.
