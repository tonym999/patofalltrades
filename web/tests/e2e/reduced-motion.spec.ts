import { test, expect } from '@playwright/test'

test.describe('Reduced motion preference', () => {
  test('removes dynamic scroll progress and shows counters without animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const progress = page.locator('[data-testid="scroll-progress"]')
    await expect(progress).toBeVisible()
    await progress.waitFor()
    const styles = await progress.evaluate((el) => getComputedStyle(el))
    expect(styles.transform === 'none' || styles.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy()
    expect(styles.willChange).toBe('auto')
    expect(Number.parseFloat(styles.opacity)).toBeLessThanOrEqual(0.36)

    await page.locator('#about').scrollIntoViewIfNeeded()
    const counters = page.locator('.counter')
    await expect(counters.nth(0)).toHaveText('10')
    await expect(counters.nth(1)).toHaveText('2500')
  })
})
