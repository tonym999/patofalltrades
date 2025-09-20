import { test, expect } from '@playwright/test'

test.describe('Smoke Test - Template', () => {
  test.skip('Example placeholder (replace with real smoke)', async ({ page }) => {
    await page.goto('/')
    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
