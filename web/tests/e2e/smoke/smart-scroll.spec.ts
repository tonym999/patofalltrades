import { test, expect } from '@playwright/test'

test.describe('Smart Scroll Behavior @smoke', () => {
  test('header hides on scroll down, shows on scroll up; bottom CTA shadow toggles', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('#navbar')
    await expect(header).toBeVisible()

    // Ensure initial state not hidden
    await expect(header).not.toHaveClass(/sticky-nav--hidden/)

    // Scroll down to trigger hide
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'auto' }))
    await expect(header).toHaveClass(/sticky-nav--hidden/)

    // Scroll up to trigger show (with 100ms debounce)
    await page.evaluate(() => window.scrollTo({ top: 100, behavior: 'auto' }))
    await expect(header).not.toHaveClass(/sticky-nav--hidden/)

    // Bottom CTA bar shadow when scrolled
    const cta = page.locator('nav[aria-label="Primary actions"]')
    await cta.waitFor({ state: 'visible', timeout: 5000 })
    await expect(cta).toHaveClass(/bottom-cta--shadow/)
    // Scroll to top, shadow can disappear
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await page.waitForTimeout(250)
    await expect(cta).not.toHaveClass(/bottom-cta--shadow/)

    // Basic a11y snapshot capture to ensure no crash
    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
 

