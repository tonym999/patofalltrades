import { test, expect, type Locator } from '@playwright/test'

const readWidth = async (locator: Locator) => locator.evaluate((el: HTMLElement) => el.clientWidth)

test.describe('Services full E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('keyboard focus cycles through cards with effects', async ({ page }) => {
    const cards = page.getByTestId('service-card')
    await expect(cards).toHaveCount(4)

    for (const index of [0, 1, 2, 3] as const) {
      const card = cards.nth(index)
      await expect(card).toHaveAttribute('tabindex', '-1')
      await card.focus()

      const icon = card.getByTestId('service-icon')
      const anim = await icon.evaluate(el => getComputedStyle(el as HTMLElement).animationName)
      expect(typeof anim).toBe('string')
      expect(anim).not.toBe('none')

      const progress = card.getByTestId('service-progress')
      const start = await readWidth(progress)
      await expect.poll(() => readWidth(progress), {
        message: 'progress width should increase shortly after focus',
        intervals: [50, 100, 150, 250],
        timeout: 1500,
      }).toBeGreaterThan(start)
    }
  })

  test('responsive columns', async ({ page }) => {
    const grid = page.locator('#services .grid')
    const cards = page.getByTestId('service-card')
    await expect(grid).toBeVisible()

    const measureColumns = async () => {
      const tops = await cards.evaluateAll((nodes) => nodes.map((n) => (n as HTMLElement).offsetTop))
      const firstRowTop = Math.min(...tops)
      return tops.filter((t) => t === firstRowTop).length
    }

    await page.setViewportSize({ width: 500, height: 800 })
    await expect.poll(measureColumns).toBe(1)

    await page.setViewportSize({ width: 800, height: 800 })
    await expect.poll(measureColumns).toBe(2)

    await page.setViewportSize({ width: 1200, height: 900 })
    await expect.poll(measureColumns).toBe(4)
  })
})
