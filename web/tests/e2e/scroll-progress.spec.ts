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

  // Helper inside Node context is not callable from page context; we centralize via a single evaluate wrapper below

  test('grows with scroll @smoke', async ({ page }) => {
    const bar = page.getByTestId('scroll-progress')
    await expect(bar).toBeAttached()
    // Don't assert visibility; at scaleX=0 the element may be effectively hidden.

    const readScale = async () => {
      return await bar.evaluate(el => {
        const t = getComputedStyle(el).transform
        if (!t || t === 'none') return 0
        const m = t.match(/matrix\(([^,]+)/)
        if (!m) return 0
        const a = parseFloat(m[1]!)
        return isNaN(a) ? 0 : a
      })
    }

    const initialScale = await readScale()

    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight / 2, behavior: 'auto' })
    })

    // Poll until scaleX increases or timeout
    await expect.poll(readScale, {
      message: 'scroll progress should increase when scrolled halfway',
      intervals: [75, 150, 225, 300],
      timeout: 3000,
    }).toBeGreaterThan(initialScale + 0.05)

    // Scroll to near bottom and expect the bar to approach full width
    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight, behavior: 'auto' })
    })

    await expect.poll(readScale, {
      message: 'scroll progress should approach full width near bottom',
      intervals: [75, 150, 225, 300],
      timeout: 3000,
    }).toBeGreaterThanOrEqual(0.85)
  })
})
