import { test, expect } from '@playwright/test'

test.describe('Smoke @smoke - Skip navigation', () => {
  test('activating skip link focuses main and captures a11y snapshot @smoke', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.focus('body')
    await page.keyboard.press('Tab')

    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')

    const main = page.locator('main#main-content')
    await expect(main).toBeFocused()
    await expect(page).toHaveURL(/#main-content$/)

    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
