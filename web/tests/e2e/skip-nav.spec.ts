import { test, expect } from '@playwright/test'

test.describe('Skip navigation', () => {
  test('skip link receives initial focus and moves focus to main content', async ({ page }) => {
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
  })
})
