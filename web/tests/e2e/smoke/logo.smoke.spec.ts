import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Smoke @smoke - Header logo renders and is accessible', () => {
  test('Logo is visible with correct alt text', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('#navbar')
    await expect(header).toBeVisible()

    const logoImg = page.getByRole('img', { name: 'Pat Of All Trades' }).first()
    await expect(logoImg).toBeVisible()

    // Basic accessibility tree snapshot
    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()

    // Run Axe on the header region
    const axe = await new AxeBuilder({ page })
      .include('#navbar')
      .withTags(['wcag2a','wcag2aa'])
      .analyze()
    expect(axe.violations).toEqual([])
  })
})


