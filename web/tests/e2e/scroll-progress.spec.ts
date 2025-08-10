import { test, expect } from '@playwright/test'

test.describe('Scroll progress indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.evaluate(() => {
      // Ensure tall content for reliable scrolling, and reset scroll to top
      document.body.style.minHeight = '300vh'
      document.documentElement.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
  })

  test('grows with scroll @smoke', async ({ page }) => {
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
    while (Date.now() - start < 2000 && currentScale <= initialScale + 0.2) {
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

    // Require a meaningful increase to avoid noise
    expect(currentScale).toBeGreaterThan(initialScale + 0.15)

    // Scroll to near bottom and expect the bar to approach full width
    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight, behavior: 'auto' })
    })

    const startBottom = Date.now()
    let bottomScale = currentScale
    while (Date.now() - startBottom < 2000 && bottomScale < 0.95) {
      await page.waitForTimeout(50)
      bottomScale = await bar.evaluate(el => {
        const t = getComputedStyle(el).transform
        if (!t || t === 'none') return 0
        const m = t.match(/matrix\(([^,]+)/)
        if (!m) return 0
        const a = parseFloat(m[1]!)
        return isNaN(a) ? 0 : a
      })
    }

    expect(bottomScale).toBeGreaterThanOrEqual(0.95)
  })
})


