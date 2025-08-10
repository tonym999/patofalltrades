import { test, expect } from '@playwright/test'

const readWidth = async (locator: any) => locator.evaluate((el: HTMLElement) => el.clientWidth)

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

      const progress = card.getByTestId('service-progress')
      const start = await readWidth(progress)
      await page.waitForTimeout(400)
      const mid = await readWidth(progress)
      expect(mid).toBeGreaterThan(start)
      await page.keyboard.press('Tab')
    }
  })

  test('responsive columns', async ({ page }) => {
    const grid = page.locator('#services .grid')
    await page.setViewportSize({ width: 500, height: 800 })
    await expect(grid).toBeVisible()
    await page.waitForTimeout(100)

    await page.setViewportSize({ width: 800, height: 800 })
    await page.waitForTimeout(100)

    await page.setViewportSize({ width: 1200, height: 900 })
    await page.waitForTimeout(100)
  })
})


