import { test, expect } from '@playwright/test'

test.describe('Smart Scroll Behavior @smoke', () => {
  // Ensure mobile layout so MobileCtaBar is visible (md:hidden on desktop)
  test.use({ viewport: { width: 390, height: 844 } })
  test('header hides on scroll down, shows on scroll up; bottom CTA shadow toggles', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('#navbar')
    await expect(header).toBeVisible()

    // Ensure initial state not hidden
    await expect(header).not.toHaveClass(/sticky-nav--hidden/)

    // Scroll down to trigger hide
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'auto' }))
    await expect.poll(
      async () => header.evaluate((el) => el.classList.contains('sticky-nav--hidden')),
      { message: 'header should hide after scrolling down', intervals: [50, 100, 150, 250], timeout: 1500 }
    ).toBeTruthy()

    // Scroll up to trigger show (with 100ms debounce)
    await page.evaluate(() => window.scrollTo({ top: 100, behavior: 'auto' }))
    await expect.poll(
      async () => header.evaluate((el) => el.classList.contains('sticky-nav--hidden')),
      { message: 'header should reappear after scrolling up', intervals: [50, 100, 150, 250], timeout: 1500 }
    ).toBeFalsy()

    // Bottom CTA bar shadow when scrolled
    const cta = page.locator('nav[aria-label="Primary actions"]')
    await cta.waitFor({ state: 'visible', timeout: 5000 })
    await expect.poll(
      async () => cta.evaluate((el) => el.classList.contains('bottom-cta--shadow')),
      { message: 'CTA should gain shadow after scrolling', intervals: [50, 100, 150, 250], timeout: 1500 }
    ).toBeTruthy()
    // Scroll to top, shadow can disappear
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await expect.poll(
      async () => cta.evaluate((el) => el.classList.contains('bottom-cta--shadow')),
      { message: 'CTA shadow should clear near top', intervals: [50, 100, 150, 250], timeout: 2000 }
    ).toBeFalsy()

    // Basic a11y snapshot capture to ensure no crash
    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
 
