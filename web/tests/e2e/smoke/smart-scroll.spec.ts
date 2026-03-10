import { test, expect } from '@playwright/test'

test.describe('Smart Scroll Behavior @smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('header remains visible during scroll; bottom CTA shadow toggles', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
    await expect.poll(
      async () => page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight),
      { message: 'ensure page has scrollable height', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeTruthy()

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
    const cta = page.getByRole('navigation', { name: 'Primary actions' })
    await cta.waitFor({ state: 'visible', timeout: 5000 })

    const fixedSurfaceFilters = await Promise.all([
      header.evaluate((el) => getComputedStyle(el).backdropFilter),
      cta.evaluate((el) => getComputedStyle(el).backdropFilter),
    ])

    expect(fixedSurfaceFilters).toEqual(['none', 'none'])

    // Header stays visible after scrolling down (static glassmorphism nav)
    await page.mouse.wheel(0, 900)
    await expect.poll(
      async () => page.evaluate(() => window.scrollY),
      { message: 'should move far enough down the page', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeGreaterThan(400)
    await expect(header).toBeVisible()

    // Bottom CTA bar shadow when scrolled
    await expect.poll(
      async () => cta.getAttribute('data-shadowed'),
      { message: 'CTA should gain shadow after scrolling', intervals: [150, 225, 300, 375], timeout: 3200 }
    ).toBe('true')

    // Scroll to top, shadow clears
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await expect.poll(
      async () => page.evaluate(() => window.scrollY <= 2),
      { message: 'return to top before checking CTA shadow clears', intervals: [100, 150, 200, 300], timeout: 3000 }
    ).toBeTruthy()
    await expect.poll(
      async () => cta.getAttribute('data-shadowed'),
      { message: 'CTA shadow should clear near top', intervals: [150, 225, 300, 375], timeout: 3200 }
    ).toBe('false')

    await test.step('capture a11y tree for scroll state', async () => {
      const ax = await page.accessibility.snapshot()
      expect(ax).toBeTruthy()
      expect(['document', 'WebArea']).toContain(ax?.role)
    })
  })
})
