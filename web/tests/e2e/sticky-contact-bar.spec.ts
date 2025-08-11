import { test, expect } from '@playwright/test'

test.describe('Mobile sticky contact bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Emulate a small/mobile viewport so elements with `md:hidden` are visible
    await page.setViewportSize({ width: 390, height: 844 })
    // Ensure sufficient page height and reset scroll position
    await page.evaluate(() => {
      document.body.style.minHeight = '300vh'
      document.documentElement.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
  })

  test('appears after scrolling @smoke', async ({ page }) => {
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toHaveCount(0)

    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'auto' }))
    await expect(moreButton).toBeVisible()
  })

  test('expands to show contact options and can be closed', async ({ page }) => {
    // Reveal the bar
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'auto' }))
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()

    // Expand
    await moreButton.click()
    const heading = page.getByRole('heading', { name: 'Get In Touch', level: 3 })
    await expect(heading).toBeVisible()

    // Verify key contact options
    const callLink = page.getByRole('link', { name: 'Call Now' }).first()
    await expect(callLink).toHaveAttribute('href', 'tel:+447123456789')

    const waLink = page.getByRole('link', { name: 'WhatsApp' })
    await expect(waLink).toHaveAttribute('href', 'https://wa.me/447123456789')

    const emailLink = page.getByRole('link', { name: 'Email' })
    await expect(emailLink).toHaveAttribute('href', 'mailto:pat@patofalltrades.co.uk')

    // Close via the close button inside the panel
    await page.getByRole('button', { name: 'Close contact options' }).click()
    await expect(heading).toBeHidden()
  })
})


