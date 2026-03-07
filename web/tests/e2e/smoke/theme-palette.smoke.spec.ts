import { test, expect } from '@playwright/test'

test.describe('Smoke Test - Theme palette', () => {
  test('exposes CSS variables and applies them to the layout shell @smoke', async ({ page }) => {
    await page.goto('/')
    await page.accessibility.snapshot()

    const rootBackground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
    )
    expect(rootBackground).toBe('224 28% 14%')

    const rootForeground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
    )
    expect(rootForeground).toBe('0 0% 100%')

    const bodyTextColor = await page.evaluate(() => getComputedStyle(document.body).color)
    expect(bodyTextColor).toBe('rgb(255, 255, 255)')

    const bodyBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundImage)
    expect(bodyBackground).toContain('linear-gradient')
  })
})
