import { test, expect } from '@playwright/test'
import { CONTACT_INFO } from '../../config/contact'

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
    await expect(callLink).toHaveAttribute('href', `tel:${CONTACT_INFO.phoneE164}`)

    const waLink = page.getByRole('link', { name: 'WhatsApp' })
    await expect(waLink).toHaveAttribute('href', `https://wa.me/${CONTACT_INFO.whatsappDigits}`)

    const emailLink = page.getByRole('link', { name: 'Email' })
    await expect(emailLink).toHaveAttribute('href', `mailto:${CONTACT_INFO.email}`)

    // Close via the close button inside the panel
    await page.getByRole('button', { name: 'Close contact options' }).click()
    await expect(heading).toBeHidden()
  })

  test('disappears when scrolling back to top', async ({ page }) => {
    // Scroll down to show bar
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'auto' }))
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()
    // Scroll back to top and expect the bar to be removed
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await expect(moreButton).toHaveCount(0)
  })

  test('respects reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'auto' }))
    // Verify animations preference does not block functionality
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()
  })

  test('supports keyboard navigation', async ({ page }) => {
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'auto' }))
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()
    // Focus via keyboard and activate with Enter
    await moreButton.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Get In Touch', level: 3 })).toBeVisible()
  })
})


