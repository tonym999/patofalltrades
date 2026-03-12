import { expect, test } from '@playwright/test'

import { expectNoSeriousViolations, prepareReducedMotionPage } from '../utils/a11y'

const DESKTOP_SCOPES = [
  { name: 'Header', selector: 'header' },
  { name: 'Main content', selector: 'main#main-content' },
  { name: 'Services', selector: '#services' },
  { name: 'Portfolio', selector: '#portfolio' },
  { name: 'Testimonials', selector: '#testimonials' },
  { name: 'Footer', selector: 'footer' },
] as const

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

    for (const scope of DESKTOP_SCOPES) {
      await test.step(`axe scan: ${scope.name}`, async () => {
        await expectNoSeriousViolations(page, scope.selector, scope.name)
      })
    }
  })
})
