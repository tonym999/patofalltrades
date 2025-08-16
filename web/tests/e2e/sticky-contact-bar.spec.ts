import { test, expect, devices } from '@playwright/test'
import { CONTACT_INFO } from '../../config/contact'

test.describe('Mobile sticky contact bar', () => {
  test.use({ ...devices['iPhone 12'] })
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // Ensure sufficient page height and reset scroll position
    await page.evaluate(() => {
      document.body.style.minHeight = '300vh'
      document.documentElement.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
  })

  test('appears after scrolling @smoke', async ({ page }) => {
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeHidden()

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
    const panel = page.locator('#contact-options-panel')
    const callLink = panel.getByRole('link', { name: 'Call Now' })
    await expect(callLink).toHaveAttribute('href', `tel:${CONTACT_INFO.phoneE164}`)

    const waLink = panel.getByRole('link', { name: 'WhatsApp' })
    await expect(waLink).toHaveAttribute('href', `https://wa.me/${CONTACT_INFO.whatsappDigits}`)

    const emailLink = panel.getByRole('link', { name: 'Email' })
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
    // Scroll back to top and expect the bar to be hidden
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await expect(moreButton).toBeHidden()
  })

  test('respects reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      document.body.style.minHeight = '300vh'
      document.documentElement.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
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
    await expect(moreButton).toBeFocused()
    await page.keyboard.press('Enter')
    const closeBtn = page.getByRole('button', { name: 'Close contact options' })
    await expect(closeBtn).toBeVisible()
    await expect(closeBtn).toBeFocused()
  })
})


