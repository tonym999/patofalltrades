import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('hero renders and image is visible', async ({ page }) => {
    await page.goto('/')
    const heroImg = page.getByAltText('Handyman hero background')
    await expect(heroImg).toBeVisible()
  })

  test('floating tools are decorative (aria-hidden)', async ({ page }) => {
    await page.goto('/')
    const decorativeWrappers = page.locator('div[aria-hidden="true"]')
    await expect(decorativeWrappers.first()).toBeVisible()
  })
})


