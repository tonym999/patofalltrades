import { test, expect } from '@playwright/test'

test.describe('Scroll progress indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('grows with scroll', async ({ page }) => {
    const bar = page.getByTestId('scroll-progress')
    await expect(bar).toBeAttached()
    // Don't assert visibility; at scaleX=0 the element may be effectively hidden.

    const getScaleX = (transform: string | null) => {
      if (!transform || transform === 'none') return 0
      // matrix(a, b, c, d, e, f) => a is scaleX
      const match = transform.match(/matrix\(([^,]+)/)
      if (!match) return 0
      const a = parseFloat(match[1])
      return isNaN(a) ? 0 : a
    }

    const initialScale = await bar.evaluate(el => {
      const t = getComputedStyle(el).transform
      if (!t || t === 'none') return 0
      const m = t.match(/matrix\(([^,]+)/)
      if (!m) return 0
      const a = parseFloat(m[1]!)
      return isNaN(a) ? 0 : a
    })

    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight / 2, behavior: 'auto' })
    })

    // Poll until scaleX increases or timeout
    const start = Date.now()
    let currentScale = initialScale
    while (Date.now() - start < 1500 && currentScale <= initialScale) {
      await page.waitForTimeout(50)
      currentScale = await bar.evaluate(el => {
        const t = getComputedStyle(el).transform
        if (!t || t === 'none') return 0
        const m = t.match(/matrix\(([^,]+)/)
        if (!m) return 0
        const a = parseFloat(m[1]!)
        return isNaN(a) ? 0 : a
      })
    }

    expect(currentScale).toBeGreaterThan(initialScale)
  })
})


