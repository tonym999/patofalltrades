import AxeBuilder from '@axe-core/playwright'
import { test, expect, devices } from '@playwright/test'
import { ensureMobile } from './utils/ensureMobile'
import { CONTACT_INFO } from '../../config/contact'

test.use({ ...devices['iPhone 12'] })

test.describe('Mobile CTA Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await ensureMobile(page)
  })

  test('renders on mobile view and shows only two primary buttons @smoke', async ({ page }) => {
    const bar = page.getByTestId('mobile-cta-bar')
    await expect(bar).toBeVisible()
    await expect(bar.getByTestId('mobile-cta-link')).toHaveCount(2)
    await expect(bar.locator('[data-testid="mobile-cta-link"][data-action="call"]')).toBeVisible()
    await expect(bar.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')).toBeVisible()
    await expect(bar.locator('[data-testid="mobile-cta-link"][data-action="whatsapp"]')).toHaveCount(0)
  })

  test('uses the dark theme surface and gold-accent button styling', async ({ page }) => {
    const nav = page.getByTestId('mobile-cta-bar')
    await expect(nav).toBeVisible()

    const navStyles = await nav.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        className: (el as HTMLElement).className,
        computedBackgroundColor: cs.backgroundColor,
        computedBorderTopColor: cs.borderTopColor,
      }
    })

    expect(navStyles.className).toContain('mobile-cta-surface')
    expect(navStyles.computedBackgroundColor).toBe('rgba(26, 31, 46, 0.95)')
    expect(navStyles.computedBorderTopColor).toBe('rgba(255, 255, 255, 0.1)')

    const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
    const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')

    const [neutralStyles, quoteStyles] = await Promise.all([
      call.evaluate((el) => {
        const cs = getComputedStyle(el)
        return {
          className: (el as HTMLElement).className,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
        }
      }),
      getQuote.evaluate((el) => {
        const cs = getComputedStyle(el)
        return {
          className: (el as HTMLElement).className,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
        }
      }),
    ])

    expect(neutralStyles.className).toContain('mobile-cta-neutral')
    expect(neutralStyles.color).toBe('rgb(209, 213, 219)')
    expect(neutralStyles.backgroundColor).toBe('rgba(255, 255, 255, 0.05)')

    expect(quoteStyles.className).toContain('cta-btn')
    expect(quoteStyles.color).toBe('rgb(26, 31, 46)')
    expect(quoteStyles.backgroundColor).toBe('rgb(212, 175, 55)')
  })

  test('passes axe accessibility checks @a11y', async ({ page }) => {
    await expect(page.getByTestId('mobile-cta-bar')).toBeVisible()
    const results = await new AxeBuilder({ page })
      .include('[data-testid="mobile-cta-bar"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('buttons meet WCAG 4.5:1 contrast', async ({ page }) => {
    async function contrastOf(locator: import('@playwright/test').Locator): Promise<number> {
      return locator.evaluate((el: Element) => {
        const toLin = (v: number): number => {
          const x = v / 255
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
        }
        const luminance = (r: number, g: number, b: number): number => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
        const getRGB = (cssColor: string): [number, number, number, number] => {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = 1
          const ctx = canvas.getContext('2d')!
          ctx.clearRect(0, 0, 1, 1)
          ctx.fillStyle = cssColor
          ctx.fillRect(0, 0, 1, 1)
          const [r, g, b, a] = Array.from(ctx.getImageData(0, 0, 1, 1).data) as [number, number, number, number]
          return [r, g, b, a / 255]
        }
        const composite = (
          foreground: [number, number, number, number],
          background: [number, number, number, number]
        ): [number, number, number, number] => {
          const alpha = foreground[3] + background[3] * (1 - foreground[3])
          if (alpha === 0) return [0, 0, 0, 0]
          const r = ((foreground[0] * foreground[3]) + (background[0] * background[3] * (1 - foreground[3]))) / alpha
          const g = ((foreground[1] * foreground[3]) + (background[1] * background[3] * (1 - foreground[3]))) / alpha
          const b = ((foreground[2] * foreground[3]) + (background[2] * background[3] * (1 - foreground[3]))) / alpha
          return [r, g, b, alpha]
        }

        const resolveBackground = (start: Element): [number, number, number, number] => {
          let bg: [number, number, number, number] = [255, 255, 255, 0]
          let node: Element | null = start
          while (node) {
            const rgba = getRGB(getComputedStyle(node).backgroundColor)
            bg = composite(rgba, bg)
            if (bg[3] >= 0.999) {
              return [bg[0], bg[1], bg[2], 1]
            }
            node = (node as HTMLElement).parentElement
          }
          return composite(bg, [255, 255, 255, 1])
        }

        const text = getRGB(getComputedStyle(el).color)
        const bg = resolveBackground(el)
        const lighter = Math.max(luminance(text[0], text[1], text[2]), luminance(bg[0], bg[1], bg[2]))
        const darker = Math.min(luminance(text[0], text[1], text[2]), luminance(bg[0], bg[1], bg[2]))
        return (lighter + 0.05) / (darker + 0.05)
      })
    }

    const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
    expect(await contrastOf(call)).toBeGreaterThanOrEqual(4.5)

    const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')
    expect(await contrastOf(getQuote)).toBeGreaterThanOrEqual(4.5)
  })

  test('tel link opens dialer scheme', async ({ page }) => {
    const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
    await expect(call).toHaveAttribute('href', `tel:${CONTACT_INFO.phoneE164}`)
  })

  test('Get Quote scrolls to #contact and focuses first field', async ({ page }) => {
    const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')
    await expect(getQuote).toBeVisible()
    await getQuote.click()
    const nameInput = page.locator('#name')
    await expect(nameInput).toBeFocused()
    await expect(page).toHaveURL(/#contact$/)
  })

  test('buttons are at least 44px tall', async ({ page }) => {
    const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')
    await expect(getQuote).toBeVisible()
    const quoteBox = await getQuote.boundingBox()
    expect(quoteBox).not.toBeNull()
    expect(quoteBox!.height).toBeGreaterThanOrEqual(44)

    const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
    await expect(call).toBeVisible()
    const callBox = await call.boundingBox()
    expect(callBox).not.toBeNull()
    expect(callBox!.height).toBeGreaterThanOrEqual(44)
  })

  test('footer keeps the full contact list available', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()

    const callLink = footer.getByRole('link', { name: /Call Pat/i })
    const whatsappLink = footer.getByRole('link', { name: /WhatsApp Pat/i })
    const emailLink = footer.getByRole('link', { name: /Email Pat/i })

    await expect(callLink).toBeVisible()
    await expect(whatsappLink).toBeVisible()
    await expect(emailLink).toBeVisible()

    const stickyBar = page.getByTestId('mobile-cta-bar')
    const [emailBox, barBox] = await Promise.all([emailLink.boundingBox(), stickyBar.boundingBox()])

    expect(emailBox).not.toBeNull()
    expect(barBox).not.toBeNull()
    expect(emailBox!.y + emailBox!.height).toBeLessThanOrEqual(barBox!.y - 8)
  })

  test('visible focus rings on keyboard focus', async ({ page }) => {
    await page.focus('body')
    const ctaLinks = page.getByTestId('mobile-cta-link')
    const call = ctaLinks.nth(0)
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab')
      if (await call.evaluate((el) => el === document.activeElement)) break
    }
    await expect(call).toBeFocused()
    const getFocusSignal = (locator: typeof call) => locator.evaluate((el) => {
      const cs = getComputedStyle(el)
      const outlineWidth = Number.parseFloat(cs.outlineWidth || '0')
      if (Number.isFinite(outlineWidth) && outlineWidth > 0) return 'outline'
      const boxShadow = (cs.boxShadow || '').trim().toLowerCase()
      if (boxShadow && boxShadow !== 'none') return 'shadow'
      return 'none'
    })

    expect(await getFocusSignal(call)).not.toBe('none')

    await page.keyboard.press('Tab')
    const getQuote = ctaLinks.nth(1)
    await expect(getQuote).toBeFocused()
    expect(await getFocusSignal(getQuote)).not.toBe('none')
  })

  test('respects safe-area bottom padding', async ({ page }) => {
    const barContainer = page.getByTestId('mobile-cta-padding')
    const paddingMetrics = await barContainer.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        paddingBottom: Number.parseFloat(cs.paddingBottom || '0'),
        resolved: cs.getPropertyValue('padding-bottom'),
      }
    })
    expect(Number.isFinite(paddingMetrics.paddingBottom)).toBeTruthy()
    expect(paddingMetrics.paddingBottom).toBeGreaterThanOrEqual(12)
    expect(paddingMetrics.resolved.trim()).toMatch(/px$/)
  })
})
