import { test, expect, devices } from '@playwright/test'

test.describe('Accessibility focus management', () => {
  test('primary navigation receives focus in order when tabbing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.focus('body')
    await page.keyboard.press('Tab')

    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()

    const sequence = [
      { textPattern: /Pat Of All Trades/, href: '#services' },
      { textPattern: /^Services$/, href: '#services' },
      { textPattern: /^Portfolio$/, href: '#portfolio' },
      { textPattern: /^About$/, href: '#about' },
      { textPattern: /^Testimonials$/, href: '#testimonials' },
      { textPattern: /^Get a Quote$/, href: '#contact' },
    ] as const

    for (const step of sequence) {
      await page.keyboard.press('Tab')
      const activeEl = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el) return null
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim(),
          href: (el as HTMLAnchorElement).getAttribute('href'),
        }
      })
      expect(activeEl).not.toBeNull()
      expect(activeEl?.tag).toBe('a')
      expect(step.textPattern.test(activeEl?.text ?? '')).toBeTruthy()
      expect(activeEl?.href).toBe(step.href)
    }
  })
})

test.describe('Reduced motion experience', () => {
  test('reduced motion media query disables animated affordances', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const progress = page.locator('[data-testid="scroll-progress"]')
    await expect(progress).toBeVisible()
    const progressStyles = await progress.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        transform: style.transform,
        willChange: style.willChange,
        opacity: style.opacity,
      }
    })
    expect(progressStyles.transform === 'none' || progressStyles.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy()
    expect(progressStyles.willChange).toBe('auto')
    expect(Number.parseFloat(progressStyles.opacity)).toBeLessThanOrEqual(0.36)

    const stickyNavTransition = await page.evaluate(() => {
      const nav = document.getElementById('navbar')
      if (!nav) return null
      return getComputedStyle(nav).transitionDuration
    })
    expect(stickyNavTransition).toBeDefined()
    expect(stickyNavTransition === '0s' || stickyNavTransition?.split(',').every((v) => v.trim() === '0s')).toBeTruthy()
  })
})

test.describe('Mobile safe-area layout', () => {
  test('bottom CTA nav accounts for device safe areas', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] })
    const page = await context.newPage()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const ctaNav = page.getByRole('navigation', { name: 'Primary actions' })
    await expect(ctaNav).toBeVisible()
    const navInlineStyle = await ctaNav.evaluate((el) => el.getAttribute('style') ?? '')
    expect(navInlineStyle).toContain('safe-area-inset-left')
    expect(navInlineStyle).toContain('safe-area-inset-right')

    const inner = page.getByTestId('mobile-cta-padding')
    const innerPadding = await inner.evaluate((el) => {
      const style = getComputedStyle(el)
      return parseFloat(style.paddingBottom || '0')
    })
    expect(innerPadding).toBeGreaterThanOrEqual(12)

    await context.close()
  })
})
