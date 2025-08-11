import { test, expect, type Locator } from '@playwright/test'

const readWidth = async (locator: Locator) => locator.evaluate((el: HTMLElement) => el.clientWidth)

test.describe('Services @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('service card focus animates icon and progress @smoke', async ({ page }) => {
    const cards = page.getByTestId('service-card')
    await expect(cards).toHaveCount(4)

    const first = cards.first()
    await first.focus()

    const icon = first.getByTestId('service-icon')
    const animationName = await icon.evaluate(el => getComputedStyle(el as HTMLElement).animationName)
    expect(typeof animationName).toBe('string')
    expect(animationName).not.toBe('none')

    const progress = first.getByTestId('service-progress')
    const container = await progress.evaluateHandle(el => el.parentElement as HTMLElement)

    const start = await readWidth(progress)
    await page.waitForTimeout(400)
    const mid = await readWidth(progress)
    expect(mid).toBeGreaterThan(start)

    await page.waitForTimeout(1600)
    const finalWidth = await readWidth(progress)
    const containerWidth = await container.evaluate(el => el.clientWidth)
    expect(finalWidth / containerWidth).toBeGreaterThan(0.9)

    // Move focus to next card to leave focus-within scope and wait for reset
    await cards.nth(1).focus()
    await expect.poll(async () => (await readWidth(progress)) / containerWidth, {
      message: 'progress bar should reset width after focus leaves',
      intervals: [50, 100, 150, 250],
      timeout: 1500,
    }).toBeLessThanOrEqual(0.2)
  })
})


