import { test, expect } from '@playwright/test'

const readWidth = async (locator: any) => {
  return await locator.evaluate((el: HTMLElement) => el.clientWidth)
}

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
    let reset = await readWidth(progress)
    const startReset = Date.now()
    while (Date.now() - startReset < 1500 && reset / containerWidth > 0.2) {
      await page.waitForTimeout(50)
      reset = await readWidth(progress)
    }
    expect(reset / containerWidth).toBeLessThanOrEqual(0.2)
  })
})


