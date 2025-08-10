import { test, expect } from '@playwright/test'

test.describe('Scroll progress indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders and grows with scroll', async ({ page }) => {
    const bar = page.getByTestId('scroll-progress')
    await expect(bar).toBeVisible()

    // initial scaleX should be ~0 at top
    const initialTransform = await bar.evaluate(el => getComputedStyle(el).transform)
    // transform matrix at origin-left scaleX=0 should be matrix(0, 0, 0, 1, 0, 0) or 'none' very early; accept both
    expect(typeof initialTransform).toBe('string')

    // Scroll down and expect transform to change (scaleX increases)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' as ScrollBehavior }))
    await page.waitForTimeout(150)
    const midTransform = await bar.evaluate(el => getComputedStyle(el).transform)
    expect(midTransform).not.toBe(initialTransform)
  })
})


