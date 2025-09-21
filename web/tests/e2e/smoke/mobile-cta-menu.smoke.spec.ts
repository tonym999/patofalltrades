import { test, expect } from '@playwright/test'

const MOBILE_VIEWPORT = { width: 390, height: 844 }

test.describe('Smoke @smoke - Mobile CTA bar coexists with menu', () => {
  test('CTA bar visible before open and after close', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await page.goto('/')

    const ctaNav = page.getByRole('navigation', { name: 'Primary actions' })
    await expect(ctaNav).toBeVisible()

    const hamburger = page.getByTestId('header-hamburger')
    await expect(hamburger).toBeVisible()
    await hamburger.focus()
    await page.keyboard.press('Enter')

    const dialog = page.locator('#mobile-menu-panel')
    await expect(dialog).toBeVisible()

    // Close with Escape and confirm focus returns
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(hamburger).toBeFocused()

    // Scroll a bit after closing to ensure sticky CTA remains in view
    await page.evaluate(() => window.scrollTo(0, 400))
    await expect(ctaNav).toBeVisible()

    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
