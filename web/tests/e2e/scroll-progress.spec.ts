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

    const readProgress = async () => {
      return await bar.evaluate(el => {
        const clamp = (value: number) => Math.min(Math.max(value, 0), 1)
        const style = getComputedStyle(el)
        const transform = style.transform
        const parseScaleX = (input: string | null): number | null => {
          if (!input || input === 'none') return null
          const normalized = input.trim()
          if (normalized.startsWith('matrix3d(')) {
            const parts = normalized
              .slice('matrix3d('.length, -1)
              .split(',')
              .map(v => Number.parseFloat(v.trim()))
            const scale = parts[0]
            return Number.isFinite(scale) ? clamp(scale) : null
          }
          if (normalized.startsWith('matrix(')) {
            const parts = normalized
              .slice('matrix('.length, -1)
              .split(',')
              .map(v => Number.parseFloat(v.trim()))
            const scale = parts[0]
            return Number.isFinite(scale) ? clamp(scale) : null
          }
          if (normalized.startsWith('scaleX(')) {
            const value = Number.parseFloat(normalized.slice('scaleX('.length, -1))
            return Number.isFinite(value) ? clamp(value) : null
          }
          return null
        }

        const parsed = parseScaleX(transform)
        if (parsed !== null) {
          return { mode: 'transform', value: parsed }
        }

        const backgroundSize = style.backgroundSize
        const backgroundMatch = backgroundSize.match(/^([0-9.]+)%/)
        if (backgroundMatch) {
          const pct = parseFloat(backgroundMatch[1]!)
          if (!Number.isNaN(pct)) {
            return { mode: 'background', value: clamp(pct / 100) }
          }
        }

        return { mode: 'none', value: 0 }
      })
    }

    const { value: initialValue } = await readProgress()

    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight / 2, behavior: 'auto' })
    })

    // Poll until scaleX increases or timeout
    await expect.poll(async () => (await readProgress()).value, {
      message: 'scroll progress should increase when scrolled halfway',
      intervals: [75, 150, 225, 300],
      timeout: 3000,
    }).toBeGreaterThan(initialValue + 0.05)

    // Scroll to near bottom and expect the bar to approach full width
    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight, behavior: 'auto' })
    })

    await expect.poll(async () => (await readProgress()).value, {
      message: 'scroll progress should approach full width near bottom',
      intervals: [75, 150, 225, 300],
      timeout: 3000,
    }).toBeGreaterThanOrEqual(0.85)
  })
})
