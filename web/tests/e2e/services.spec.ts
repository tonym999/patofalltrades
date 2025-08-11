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

    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i)
      await card.focus()
      const icon = card.getByTestId('service-icon')
      const anim = await icon.evaluate(el => getComputedStyle(el as HTMLElement).animationName)
      expect(typeof anim).toBe('string')
      expect(anim).not.toBe('none')

      const progress = card.getByTestId('service-progress')
      const start = await readWidth(progress)
      await page.waitForTimeout(400)
      const mid = await readWidth(progress)
      expect(mid).toBeGreaterThan(start)
      if (i < 3) {
        await page.keyboard.press('Tab')
        const next = cards.nth(i + 1)
        await expect(next).toBeFocused()
      }
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


