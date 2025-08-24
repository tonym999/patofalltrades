import { test, expect, devices } from '@playwright/test'
test.use({ ...devices['iPhone 12'] })
import { CONTACT_INFO } from '../../config/contact'

test.describe('Mobile sticky contact bar', () => {
  const scrollToAndSettle = async (page: any, y: number) => {
    await page.evaluate(async (targetY) => {
      window.scrollTo({ top: targetY, behavior: 'auto' })
      await new Promise<void>((resolve) => {
        let last = -1
        let stableFrames = 0
        let frames = 0
        const MAX_FRAMES = 120
        const tick = () => {
          const cur = typeof window.scrollY === 'number' ? window.scrollY : (window.pageYOffset ?? 0)
          stableFrames = cur === last ? stableFrames + 1 : 0
          last = cur
          if (stableFrames >= 2 || frames++ > MAX_FRAMES) {
            return requestAnimationFrame(() => resolve())
          }
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      window.dispatchEvent(new Event('scroll'))
    }, y)
  }

  const revealByIncrementalScroll = async (page: any) => {
    await page.evaluate(async () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      let attempts = 0
      return await new Promise<void>((resolve) => {
        const step = () => {
          if (document.querySelector('[data-testid="sticky-contact-bar"]')) return resolve()
          if (attempts++ > 60) return resolve()
          const next = Math.min(window.scrollY + Math.round(window.innerHeight * 0.25), maxScroll)
          window.scrollTo({ top: next, behavior: 'auto' })
          window.dispatchEvent(new Event('scroll'))
          requestAnimationFrame(() => setTimeout(step, 30))
        }
        step()
      })
    })
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

    await revealByIncrementalScroll(page)
    const bar = page.getByTestId('sticky-contact-bar').first()
    await bar.waitFor({ state: 'visible' })
    await expect(moreButton).toBeVisible()
  })

  test('expands to show contact options and can be closed', async ({ page }) => {
    // Reveal the bar
    await revealByIncrementalScroll(page)
    const bar = page.getByTestId('sticky-contact-bar').first()
    await bar.waitFor({ state: 'visible' })
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
    await revealByIncrementalScroll(page)
    const bar = page.getByTestId('sticky-contact-bar').first()
    await bar.waitFor({ state: 'visible' })
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
    await revealByIncrementalScroll(page)
    const bar = page.getByTestId('sticky-contact-bar').first()
    await bar.waitFor({ state: 'visible' })
    // Verify animations preference does not block functionality
    const moreButton = page.getByRole('button', { name: 'More' })
    await expect(moreButton).toBeVisible()
  })

  test('supports keyboard navigation', async ({ page }) => {
    await revealByIncrementalScroll(page)
    const bar = page.getByTestId('sticky-contact-bar').first()
    await bar.waitFor({ state: 'visible' })
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


