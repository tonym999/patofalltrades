import { test, expect } from '@playwright/test'

const MOBILE_VIEWPORT = { width: 390, height: 844 }

test.describe('Smoke @smoke - Mobile CTA bar coexists with menu', () => {
  test('CTA bar keeps two primary actions while footer keeps the full contact list', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await page.goto('/')

    const ctaNav = page.getByRole('navigation', { name: 'Primary actions' })
    await expect(ctaNav).toBeVisible()
    await expect(ctaNav.getByTestId('mobile-cta-link')).toHaveCount(2)

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

    // Scroll through the page to ensure sticky CTA remains in view until the footer contact list appears.
    await page.evaluate(() => window.scrollTo(0, 400))
    await expect(ctaNav).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer.getByRole('link', { name: /Call Pat/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /WhatsApp Pat/i })).toBeVisible()
    await expect(footer.getByRole('link', { name: /Email Pat/i })).toBeVisible()

    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
