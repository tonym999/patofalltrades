import { expect, test } from '@playwright/test'

import { CORE_A11Y_SCOPES } from '../utils/a11y-scopes'
import { expectNoSeriousViolations, prepareReducedMotionPage } from '../utils/a11y'

test.describe('A11y baseline - desktop', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
  })

  test('sweeps key desktop surfaces for WCAG 2.1 AA serious and critical issues', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await prepareReducedMotionPage(page)
    await expect(page).toHaveURL(/\/$/)

    for (const scope of CORE_A11Y_SCOPES) {
      await test.step(`axe scan: ${scope.name}`, async () => {
        await expectNoSeriousViolations(page, scope.selector, scope.name)
      })
    }
  })
})
