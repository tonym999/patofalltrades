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
    const containerWidth = await progress.evaluate(el => el.parentElement?.clientWidth ?? 0)
    expect(containerWidth).toBeGreaterThan(0)

    const start = await readWidth(progress)
    await expect.poll(() => readWidth(progress), {
      message: 'progress width should increase while focused',
      intervals: [50, 100, 150, 250],
      timeout: 1500,
    }).toBeGreaterThan(start)

    await expect.poll(async () => {
      const current = await readWidth(progress)
      return current / containerWidth
    }, {
      message: 'progress bar should fill near 100% while focused',
      intervals: [100, 150, 200, 250],
      timeout: 2000,
    }).toBeGreaterThan(0.9)

    // Move focus to next card to leave focus-within scope and wait for reset
    await cards.nth(1).focus()
    await expect.poll(async () => (await readWidth(progress)) / containerWidth, {
      message: 'progress bar should reset width after focus leaves',
      intervals: [50, 100, 150, 250],
      timeout: 1500,
    }).toBeLessThanOrEqual(0.2)
  })
})
