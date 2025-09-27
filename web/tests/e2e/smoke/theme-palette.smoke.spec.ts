import { test, expect } from '@playwright/test'

test.describe('Smoke Test - Theme palette', () => {
  test('exposes CSS variables and applies them to the layout shell @smoke', async ({ page }) => {
    await page.goto('/')
    await page.accessibility.snapshot()

    const rootBackground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
    )
    expect(rootBackground).toBe('221 61% 8%')

    const rootForeground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
    )
    expect(rootForeground).toBe('221 100% 96%')

    const bodyTextColor = await page.evaluate(() => getComputedStyle(document.body).color)
    expect(bodyTextColor).toBe('rgb(235, 241, 255)')

    const bodyBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundImage)
    expect(bodyBackground).toContain('rgb(15, 25, 47)')
    expect(bodyBackground).toContain('rgb(8, 16, 33)')
  })
})
