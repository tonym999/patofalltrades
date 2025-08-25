import { test, expect, devices } from '@playwright/test'
import type { Page, Locator } from '@playwright/test'
test.use({ ...devices['iPhone 12'] })
import { CONTACT_INFO } from '../../config/contact'

test.describe('Mobile sticky contact bar', () => {
  const scrollToAndSettle = async (page: Page, y: number) => {
    await page.evaluate((targetY) => window.scrollTo({ top: targetY, behavior: 'auto' }), y)
    await page.waitForFunction(
      (target) => {
        const y = (window.scrollY ?? window.pageYOffset ?? document.documentElement?.scrollTop ?? document.body?.scrollTop ?? 0)
        return Math.abs(y - target) < 1
      },
      y,
      { polling: 'raf' }
    )
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
  }

  const revealBar = async (page: Page): Promise<Locator> => {
    // Incrementally scroll on each RAF until the bar appears or timeout hits
    await page.waitForFunction(
      () => {
        if (document.querySelector('[data-testid="sticky-contact-bar"]')) return true
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const next = Math.min((window.scrollY ?? 0) + Math.round(window.innerHeight * 0.25), maxScroll)
        window.scrollTo(0, next)
        return false
      },
      { polling: 'raf', timeout: 10_000 }
    )
    const bar = page.getByTestId('sticky-contact-bar').first()
    await bar.waitFor({ state: 'visible' })
    return bar
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // Ensure sufficient page height and reset scroll position
    await page.evaluate(() => {
      document.documentElement.style.minHeight = '4000px'
      document.body.style.minHeight = '4000px'
      document.documentElement.style.overflowY = 'auto'
      document.body.style.overflowY = 'visible'
      document.documentElement.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
    // Disable smooth scrolling to avoid long animations in tests
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
    // Wait briefly for client components to hydrate (ScrollProgress mounts only on client)
    try {
      await page.getByTestId('scroll-progress').first().waitFor({ state: 'attached', timeout: 2000 })
    } catch {}
  })

  test('appears after scrolling @smoke', async ({ page }) => {
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeHidden()

    const bar = await revealBar(page)
    await expect(moreButton).toBeVisible()
  })

  test('expands to show contact options and can be closed', async ({ page }) => {
    // Reveal the bar
    const bar = await revealBar(page)
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()

    // Expand
    await expect(moreButton).toHaveAttribute('aria-expanded', 'false')
    await moreButton.click()
    const heading = page.getByRole('heading', { name: 'Get In Touch', level: 3 })
    await expect(heading).toBeVisible()
    await expect(moreButton).toHaveAttribute('aria-expanded', 'true')

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
    const bar = await revealBar(page)
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()
    // Scroll back to top and expect the bar to be hidden
    await scrollToAndSettle(page, 0)
    await page.getByTestId('sticky-contact-bar').waitFor({ state: 'detached' })
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
    const bar = await revealBar(page)
    // Verify animations preference does not block functionality
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()
  })

  test('supports keyboard navigation', async ({ page }) => {
    const bar = await revealBar(page)
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

  test('backdrop click closes and returns focus', async ({ page }) => {
    const bar = await revealBar(page)
    const moreButton = page.getByRole('button', { name: 'More' })
    await moreButton.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Click explicit overlay near top-left to avoid the bottom sheet area intercepting
    await page.getByTestId('contact-overlay').click({ position: { x: 10, y: 10 } })
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(moreButton).toBeFocused()
    await expect(moreButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('Escape closes the dialog and returns focus', async ({ page }) => {
    const bar = await revealBar(page)
    const moreButton = page.getByRole('button', { name: 'More' })
    await moreButton.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(moreButton).toBeFocused()
    await expect(moreButton).toHaveAttribute('aria-expanded', 'false')
  })
})


