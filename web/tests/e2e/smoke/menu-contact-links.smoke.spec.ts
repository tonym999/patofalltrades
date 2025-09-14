import { test, expect } from '@playwright/test'

test.describe('Smoke @smoke - Contact links in menu drawer', () => {
  test('WhatsApp and Email links are present with correct hrefs', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 390, height: 844 })

    const hamburger = page.getByTestId('header-hamburger')
    await expect(hamburger).toBeVisible()
    await hamburger.click()

    const dialog = page.locator('#mobile-menu-panel')
    await expect(dialog).toBeVisible()

    const whatsapp = dialog.getByRole('link', { name: 'WhatsApp' })
    await expect(whatsapp).toBeVisible()
    await expect(whatsapp).toHaveAttribute('href', /wa\.me\/447123456789\?text=/)

    const email = dialog.getByRole('link', { name: 'Email' })
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('href', 'mailto:pat@patofalltrades.co.uk')
  })
})


