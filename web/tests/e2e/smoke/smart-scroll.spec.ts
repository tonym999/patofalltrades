import { test, expect } from '@playwright/test'

test.describe('Smart Scroll Behavior @smoke', () => {
  // Ensure mobile layout so MobileCtaBar is visible (md:hidden on desktop)
  test.use({ viewport: { width: 390, height: 844 } })
  test('header hides on scroll down, shows on scroll up; bottom CTA shadow toggles', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
    await expect.poll(
      async () => page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight),
      { message: 'ensure page has scrollable height for smart header behavior', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeTruthy()

    const header = page.locator('#navbar')
    await expect(header).toBeVisible()

    // Ensure initial state not hidden
    await expect(header).not.toHaveClass(/sticky-nav--hidden/)

    // Scroll down to trigger hide
    await page.mouse.wheel(0, 900)
    await expect.poll(
      async () => page.evaluate(() => window.scrollY),
      { message: 'should move far enough down the page', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeGreaterThan(400)
    await expect.poll(
      async () => header.evaluate((el) => el.classList.contains('sticky-nav--hidden')),
      { message: 'header should hide after scrolling down', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeTruthy()

    // Scroll up to trigger show (with 100ms debounce)
    await page.mouse.wheel(0, -900)
    await expect.poll(
      async () => page.evaluate(() => window.scrollY),
      { message: 'should scroll back near the top', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeLessThan(200)
    await expect.poll(
      async () => header.evaluate((el) => el.classList.contains('sticky-nav--hidden')),
      { message: 'header should reappear after scrolling up', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeFalsy()

    // Bottom CTA bar shadow when scrolled
    const cta = page.getByRole('navigation', { name: 'Primary actions' })
    await cta.waitFor({ state: 'visible', timeout: 5000 })
    await page.mouse.wheel(0, 400)
    await expect.poll(
      async () => cta.getAttribute('data-shadowed'),
      { message: 'CTA should gain shadow after scrolling', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBe('true')
    // Scroll to top, shadow can disappear
    await page.mouse.wheel(0, -400)
    await expect.poll(
      async () => page.evaluate(() => window.scrollY <= 2),
      { message: 'return to top before checking CTA shadow clears', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeTruthy()
    await expect.poll(
      async () => cta.getAttribute('data-shadowed'),
      { message: 'CTA shadow should clear near top', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBe('false')

    // Basic a11y snapshot capture to ensure no crash
    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
 
