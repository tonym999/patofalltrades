import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Smoke @smoke - Contact links in menu drawer', () => {
  test('WhatsApp and Email links are present with correct hrefs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const hamburger = page.getByTestId('header-hamburger')
    await expect(hamburger).toBeVisible()
    await hamburger.click()

    const dialog = page.locator('#mobile-menu-panel')
    await expect(dialog).toBeVisible()
    // Non-asserting snapshot for debugging per smoke guidelines
    await page.accessibility.snapshot()
    const axe = await new AxeBuilder({ page }).include('#mobile-menu-panel').withTags(['wcag2a','wcag2aa']).analyze()
    expect(axe.violations).toEqual([])
    await expect(dialog).toHaveAttribute('role', 'dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    const overlay = page.getByTestId('menu-overlay')
    await expect(overlay).toBeVisible()

    const whatsapp = dialog.getByRole('link', { name: 'WhatsApp' })
    await expect(whatsapp).toBeVisible()
    await expect(whatsapp).toHaveAttribute('href', /^https?:\/\/wa\.me\/447\d{9}(?:\?.*)?$/)
    await expect(whatsapp).toHaveAttribute('target', '_blank')
    await expect(whatsapp).toHaveAttribute('rel', /(?:^|\s)noopener(?:\s|$).*?(?:^|\s)noreferrer(?:\s|$)/)

    const email = dialog.getByRole('link', { name: 'Email' })
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('href', 'mailto:pat@patofalltrades.co.uk')
  })
})


