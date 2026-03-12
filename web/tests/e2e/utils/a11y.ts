import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_2_AA_TAGS = ['wcag2a', 'wcag2aa'] as const
const BLOCKING_IMPACTS = new Set(['serious', 'critical'])

type AxeViolation = {
  id: string
  impact?: string | null
  help: string
  nodes: Array<{ target: string[] }>
}

function formatViolations(scopeName: string, violations: AxeViolation[]): string {
  if (!violations.length) {
    return `${scopeName} should not report serious or critical Axe violations.`
  }

  const summary = violations
    .map((violation) => {
      const targets = violation.nodes
        .flatMap((node) => node.target)
        .slice(0, 3)
        .join(', ')

      return `${violation.impact ?? 'unknown'} ${violation.id}: ${violation.help}${targets ? ` (${targets})` : ''}`
    })
    .join('\n')

  return `${scopeName} reported serious or critical Axe violations:\n${summary}`
}

export async function prepareReducedMotionPage(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
}

export async function expectNoSeriousViolations(page: Page, selector: string, scopeName = selector) {
  const locator = page.locator(selector).first()

  await expect(locator, `${scopeName} should exist before running Axe`).toBeVisible()
  await locator.scrollIntoViewIfNeeded()

  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags([...WCAG_2_AA_TAGS])
    .analyze()

  const blockingViolations = results.violations.filter(
    (violation: AxeViolation) => violation.impact && BLOCKING_IMPACTS.has(violation.impact)
  )

  expect(blockingViolations, formatViolations(scopeName, blockingViolations)).toEqual([])

  return results
}
