import { test, expect } from '@playwright/test'

test.describe('Smoke Test - Template', () => {
  test('renders hero content and captures accessibility tree', async ({ page }) => {
    await page.goto('/')
    const heroHeading = page.getByRole('heading', { level: 1, name: /london's premier handyman/i })
    await expect(heroHeading).toBeVisible()

    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
