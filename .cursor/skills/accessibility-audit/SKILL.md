---
name: accessibility-audit
description: Audit frontend code for semantic structure, keyboard navigation, labels, focus management, and screen-reader support. Includes Playwright and axe-core automated testing patterns. Use when reviewing forms, modals, interactive components, navigation flows, writing accessibility tests, or validating pages before release.
---

# Accessibility Audit

## When to use
- Reviewing forms, modals, tabs, accordions, menus, drawers, or popovers
- Validating interactive components for keyboard and screen-reader support
- Checking navigation flows and focus management
- Reviewing pages before release
- Writing or reviewing Playwright accessibility tests

## Manual audit checklist

### Structure
- Semantic HTML used appropriately (`<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`)
- Heading structure is logical and sequential (no skipped levels)
- Landmarks are present and meaningful
- `<html lang="en">` is set (defined in `web/app/layout.tsx`)

### Forms
- Every input has an associated `<label>` (not just placeholder text)
- `<fieldset>` and `<legend>` used for related groups where appropriate
- Validation errors are associated with inputs via `aria-describedby`
- Error messages are clear and actionable

### Interactive elements
- `<button>` used for actions, `<a>` / `next/link` for navigation
- No `<div>` or `<span>` used as clickable elements without proper role and keyboard handling
- All interactive elements reachable via Tab
- Visible focus indicators on all focusable elements
- `aria-expanded`, `aria-controls`, `aria-labelledby` used where needed for disclosure widgets
- Escape key closes modals and drawers (this project uses vaul for drawers)

### Content
- Images have meaningful `alt` text (or `alt=""` for decorative images)
- Icons used as controls have accessible names
- Link and button text is descriptive (not "click here")
- Colour contrast meets WCAG AA (4.5:1 for text, 3:1 for large text and UI components)

### Motion
- Animations respect `prefers-reduced-motion` (this project uses framer-motion and gsap)
- No content relies solely on animation to convey meaning

## Common fixes
- `<div onClick>` → `<button>` with proper semantics
- Missing form labels → add `<label htmlFor="...">`
- Placeholder as label → add real `<label>`, keep placeholder as hint
- Icons without names → add `aria-label` or visually hidden text
- Focus trapped incorrectly → verify focus returns on modal/drawer close
- Missing heading structure → add appropriate `<h2>`–`<h6>`
- Accordion not exposing state → add `aria-expanded` to trigger

## Core principles
- Prefer native HTML over custom ARIA-heavy widgets
- Do not add ARIA if native semantics already solve the problem
- Flag issues clearly and explain the user impact
- Distinguish between minor fixes and structural problems

## Automated testing with Playwright + axe-core

This project has `@playwright/test` and `@axe-core/playwright` installed.
Tests live in `web/tests/e2e/`. Smoke tests in `smoke/`, functional tests in `functional/`.

### Full-page axe scan

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Page meets WCAG 2 AA', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(results.violations).toEqual([])
})
```

### Scoped axe check (specific region)

```typescript
const results = await new AxeBuilder({ page })
  .include('#navbar')
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze()

expect(results.violations).toEqual([])
```

### Accessibility tree snapshot

```typescript
const snapshot = await page.accessibility.snapshot()
expect(snapshot).toBeTruthy()
```

### Keyboard navigation test

```typescript
test('Tab order is logical', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('Tab')
  const first = await page.evaluate(() => document.activeElement?.tagName)
  expect(first).toBeTruthy()
})
```

### Focus management test (modal/drawer)

```typescript
test('Focus moves into dialog on open and returns on close', async ({ page }) => {
  await page.goto('/')

  const trigger = page.getByTestId('open-dialog')
  await trigger.click()
  const insideDialog = await page.evaluate(
    () => document.activeElement?.closest('[role="dialog"]') !== null
  )
  expect(insideDialog).toBe(true)

  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})
```

### Reduced motion test

```typescript
test('Animations respect prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/')

  // Verify content is accessible and no animation is blocking interaction

  await context.close()
})
```

### Test naming conventions
- Smoke: `feature.smoke.spec.ts` — tagged `@smoke`
- Functional: `feature.spec.ts`
- Include a basic axe scan and at least one accessibility snapshot in smoke tests; run thorough audits in functional suites

## Response format
1. Issues found, in priority order
2. Why each matters (user impact)
3. Code-level fixes
4. Severity: minor, moderate, or structural
5. Suggested Playwright test if the issue should be caught automatically
