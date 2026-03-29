import { test, expect } from '@playwright/test'
import { expectNoSeriousViolations, prepareReducedMotionPage } from '../utils/a11y'

test.describe('Smoke @smoke - Portfolio compare slider', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('renders before and after images @smoke', async ({ page }) => {
    const section = page.locator('#portfolio')
    await expect(section).toBeVisible()
    await expect(section.getByRole('img', { name: /before work begins/i }).first()).toBeVisible()
    await expect(section.getByRole('img', { name: /after completion/i }).first()).toBeVisible()
  })

  test('slider handle is keyboard-accessible @smoke', async ({ page }) => {
    const handle = page.locator('#portfolio').getByRole('slider').first()
    await handle.scrollIntoViewIfNeeded()
    await expect(handle).toHaveAttribute('aria-valuemin', '0')
    await expect(handle).toHaveAttribute('aria-valuemax', '100')
    await handle.focus()
    const beforeValue = await handle.getAttribute('aria-valuenow')
    await page.keyboard.press('ArrowRight')
    await expect(handle).not.toHaveAttribute('aria-valuenow', beforeValue!)
  })

  test('portfolio section has no serious axe violations @smoke', async ({ page }) => {
    await prepareReducedMotionPage(page)
    await expectNoSeriousViolations(page, '#portfolio', 'Portfolio compare slider')
  })
})
