import AxeBuilder from '@axe-core/playwright'
import { test, expect, devices } from '@playwright/test'

test.describe('Accessibility focus management', () => {
  test('skip link transfers focus to main content region', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.focus('body')
    const focused = page.locator(':focus')

    await page.keyboard.press('Tab')
    await expect(focused).toHaveText(/Skip to main content/i)
    await expect(focused).toHaveAttribute('href', '#main-content')

    await page.keyboard.press('Enter')
    await expect(page.locator('main#main-content:focus')).toHaveCount(1)
    await expect(page).toHaveURL(/#main-content$/)

    await test.step('axe sweep', async () => {
      const results = await new AxeBuilder({ page })
        .include('main#main-content')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      expect(results.violations).toEqual([])
    })
  })

  test('primary navigation receives focus in order when tabbing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.focus('body')
    const focused = page.locator(':focus')

    await page.keyboard.press('Tab')
    await expect(focused).toHaveText(/Skip to main content/i)
    await expect(focused).toHaveAttribute('href', '#main-content')

    await page.keyboard.press('Tab')

    const sequence = [
      { textPattern: /Pat Of All Trades/, href: '#services' },
      { textPattern: /^Services$/, href: '#services' },
      { textPattern: /^Portfolio$/, href: '#portfolio' },
      { textPattern: /^About$/, href: '#about' },
      { textPattern: /^Testimonials$/, href: '#testimonials' },
      { textPattern: /^Get a Quote$/, href: '#contact' },
    ] as const

    const firstStep = sequence[0]
    const remainingSteps = sequence.slice(1)

    await expect(focused).toHaveAttribute('href', firstStep.href)
    await expect(focused).toHaveText(firstStep.textPattern)

    for (const step of remainingSteps) {
      await page.keyboard.press('Tab')
      await expect(focused).toHaveAttribute('href', step.href)
      await expect(focused).toHaveText(step.textPattern)
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

    try {
      const page = await context.newPage()
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const ctaNav = page.getByRole('navigation', { name: 'Primary actions' })
      await expect(ctaNav).toBeVisible()
      const navPadding = await ctaNav.evaluate((el) => {
        const style = getComputedStyle(el)
        return {
          left: parseFloat(style.paddingLeft || '0'),
          right: parseFloat(style.paddingRight || '0'),
        }
      })
      expect(navPadding.left).toBeGreaterThanOrEqual(0)
      expect(navPadding.right).toBeGreaterThanOrEqual(0)

      const inner = page.getByTestId('mobile-cta-padding')
      const innerPadding = await inner.evaluate((el) => {
        const style = getComputedStyle(el)
        return parseFloat(style.paddingBottom || '0')
      })
      expect(innerPadding).toBeGreaterThanOrEqual(12)
    } finally {
      await context.close()
    }
  })
})
