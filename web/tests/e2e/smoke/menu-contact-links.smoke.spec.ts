import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Smoke @smoke - Contact links in menu drawer', () => {
  test('WhatsApp and Email links are present with correct hrefs', async ({ page }) => {
    test.setTimeout(20000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const hamburger = page.getByTestId('header-hamburger')
    await expect(hamburger).toBeVisible()
    await hamburger.click()

    const dialog = page.locator('#mobile-menu-panel')
    await expect(dialog).toBeVisible({ timeout: 10000 })
    // Allow menu animation to finish before querying links
    await page.waitForTimeout(300)
    // Non-asserting snapshot for debugging per smoke guidelines
    await page.accessibility.snapshot()
    const axe = await new AxeBuilder({ page }).include('#mobile-menu-panel').withTags(['wcag2a','wcag2aa']).analyze()
    expect(axe.violations).toEqual([])
    await expect(dialog).toHaveAttribute('role', 'dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    const overlay = page.getByTestId('menu-overlay')
    await expect(overlay).toBeVisible({ timeout: 10000 })

    // Prefer robust href selector first to avoid flake during animations
    const whatsappHref = dialog.locator('a[href*="wa.me"]')
    await expect(whatsappHref).toBeVisible({ timeout: 10000 })
    await expect(whatsappHref).toHaveAttribute('href', /^https?:\/\/wa\.me\/447\d{9}(?:\?.*)?$/, { timeout: 10000 })
    // Also assert accessible name via aria-label for stability
    await expect(whatsappHref).toHaveAttribute('aria-label', /whatsapp/i)
    await expect(whatsappHref).toHaveAttribute('target', '_blank')
    const relValue = await whatsappHref.getAttribute('rel')
    expect(relValue).toBeTruthy()
    const relParts = (relValue ?? '').trim().split(/\s+/)
    expect(relParts).toContain('noopener')
    expect(relParts).toContain('noreferrer')

    const email = dialog.getByRole('link', { name: 'Email' })
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('href', 'mailto:pat@patofalltrades.co.uk')
  })
})


