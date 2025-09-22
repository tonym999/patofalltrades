import { test, expect, type Locator } from '@playwright/test'

const readWidth = async (locator: Locator) => locator.evaluate((el: HTMLElement) => el.clientWidth)

test.describe('Services full E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('keyboard focus cycles through cards with effects', async ({ page }) => {
    const cards = page.getByTestId('service-card')
    await expect(cards).toHaveCount(4)

    const focus = page.locator(':focus')
    const tabToCard = async (cardIndex: number) => {
      const target = cards.nth(cardIndex)
      await expect.poll(async () => {
        await page.keyboard.press('Tab')
        return target.evaluate((el) => {
          const active = document.activeElement
          return active === el || el.contains(active)
        })
      }, {
        message: `Tab order should reach service card ${cardIndex + 1}`,
        intervals: [100, 150, 200, 300],
        timeout: 3000,
      }).toBeTruthy()
      return target
    }

    await page.focus('body')

    for (const index of [0, 1, 2, 3] as const) {
      const card = await tabToCard(index)
      await expect(card).toHaveAttribute('data-service')
      await expect(card).toHaveAttribute('tabindex', '0')
      await expect(card).toContainText(/\S/, { timeout: 3000 })
      await expect(focus).toHaveCount(1)
      const focusWithinCard = await card.evaluate((el) => el.contains(document.activeElement))
      expect(focusWithinCard).toBeTruthy()

      const icon = card.getByTestId('service-icon')
      const iconAnimation = await icon.evaluate((el) => {
        const style = getComputedStyle(el as HTMLElement)
        return {
          name: style.animationName,
          duration: style.animationDuration,
        }
      })
      expect(iconAnimation.name).toBeTruthy()
      expect(iconAnimation.name?.toLowerCase()).not.toBe('none')
      expect(Number.parseFloat(iconAnimation.duration)).toBeGreaterThan(0)

      const progress = card.getByTestId('service-progress')
      const start = await readWidth(progress)
      await expect.poll(() => readWidth(progress), {
        message: 'progress width should increase shortly after keyboard focus',
        intervals: [100, 150, 200, 300],
        timeout: 3000,
      }).toBeGreaterThan(start)

      const progressTransition = await progress.evaluate((el) => getComputedStyle(el as HTMLElement).transitionDuration)
      expect(Number.parseFloat(progressTransition)).toBeGreaterThan(0)
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
