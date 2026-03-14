import { devices, expect, test } from '@playwright/test'

import { CORE_A11Y_SCOPES } from '../utils/a11y-scopes'
import { expectNoSeriousViolations, prepareReducedMotionPage } from '../utils/a11y'

const MOBILE_SCOPES = [
  ...CORE_A11Y_SCOPES,
  { name: 'Mobile CTA bar', selector: '[data-testid="mobile-cta-bar"]' },
] as const

function withoutDefaultBrowserType(
  options: typeof devices['iPhone 12']
): Omit<typeof devices['iPhone 12'], 'defaultBrowserType'> {
  const { defaultBrowserType: _defaultBrowserType, ...rest } = options
  return rest
}

test.describe('A11y baseline - mobile', () => {
  test.use({
    ...withoutDefaultBrowserType(devices['iPhone 12']),
    reducedMotion: 'reduce',
  })

  test('sweeps key mobile surfaces and the open drawer for WCAG 2.1 AA serious and critical issues', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await prepareReducedMotionPage(page)

    for (const scope of MOBILE_SCOPES) {
      await test.step(`axe scan: ${scope.name}`, async () => {
        await expectNoSeriousViolations(page, scope.selector, scope.name)
      })
    }

    await test.step('axe scan: opened mobile menu panel', async () => {
      const menuButton = page.getByTestId('header-hamburger')

      await expect(menuButton).toBeVisible()
      await menuButton.click()
      await expect(page.locator('#mobile-menu-panel')).toBeVisible()

      await expectNoSeriousViolations(page, '#mobile-menu-panel', 'Mobile menu panel')
    })
  })
})
