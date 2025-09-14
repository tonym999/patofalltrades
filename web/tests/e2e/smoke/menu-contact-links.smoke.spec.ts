import { test, expect } from '@playwright/test'

test.describe('Smoke @smoke - Contact links in menu drawer', () => {
  test('WhatsApp and Email links are present with correct hrefs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const hamburger = page.getByTestId('header-hamburger')
    await expect(hamburger).toBeVisible()
    await hamburger.click()

    const dialog = page.locator('#mobile-menu-panel')
    await expect(dialog).toBeVisible()
    await page.accessibility.snapshot()
    await expect(dialog).toHaveAttribute('role', 'dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    const overlay = page.getByTestId('menu-overlay')
    await expect(overlay).toBeVisible()

    const whatsapp = dialog.getByRole('link', { name: 'WhatsApp' })
    await expect(whatsapp).toBeVisible()
    await expect(whatsapp).toHaveAttribute('href', /^https?:\/\/wa\.me\/447\d{9}(?:\?.*)?$/)
    await expect(whatsapp).toHaveAttribute('target', '_blank')
    await expect(whatsapp).toHaveAttribute('rel', /noopener/)
    await expect(whatsapp).toHaveAttribute('rel', /noreferrer/)

    const email = dialog.getByRole('link', { name: 'Email' })
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('href', 'mailto:pat@patofalltrades.co.uk')
  })
})


