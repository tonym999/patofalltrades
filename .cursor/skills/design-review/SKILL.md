---
name: design-review
description: Review a UI for visual hierarchy, spacing, alignment, clarity, consistency, polish, and overall UX quality. Use when reviewing components visually, reviewing pages before merge, comparing implementation against design intent, or identifying polish issues.
---

# Design Review

## When to use
- Reviewing a component or page visually
- Reviewing implementation before merge
- Comparing output against intended design quality
- Identifying polish issues
- Improving clarity and usability without redesigning

## Review priorities
Focus on the highest-value issues first:

1. **Visual hierarchy** — is the primary action obvious? Can the user scan the page quickly?
2. **Spacing consistency** — does spacing follow the project's rhythm? Any cramped or floating elements?
3. **Alignment and layout balance** — do cards, panels, and sections feel aligned?
4. **Typography and readability** — do headings and body text have clear hierarchy?
5. **Contrast and affordance** — are controls easy to identify? Are visual states distinct?
6. **Responsiveness** — does the layout adapt well on smaller screens?
7. **State design** — are loading, empty, error, and success states handled?
8. **Scannability** — does anything feel noisy or buried?

## What to check
- Is the primary action obvious?
- Is the layout easy to scan?
- Are spacing decisions consistent with the design system tokens in `globals.css`?
- Do headings and body text have a clear hierarchy?
- Do cards, panels, and sections feel aligned?
- Are controls easy to identify?
- Are visual states distinct enough (default, hover, focus, disabled, error)?
- Does anything feel cramped, floaty, or visually noisy?
- Does the design work on mobile viewports?
- Are animations purposeful and not distracting?
- Does the dark theme render well (this project defaults to dark mode)?

## Review principles
- Be concrete, not vague — reference specific elements and measurements
- Prefer practical fixes over abstract criticism
- Work with the existing design language (CSS variables, utility classes)
- Do not recommend a total redesign unless truly necessary
- Prioritise changes that improve clarity with low implementation cost
- Reference existing tokens and classes when suggesting fixes

## Response format
1. Top issues in priority order
2. Why each issue matters
3. Exact implementation suggestions (using project tokens and patterns)
4. Quick wins vs deeper structural improvements
