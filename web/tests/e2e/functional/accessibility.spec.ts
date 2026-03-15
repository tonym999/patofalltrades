import AxeBuilder from '@axe-core/playwright'
import { test, expect, devices } from '@playwright/test'

test.describe('Accessibility focus management', () => {
  test('homepage heading outline keeps one h1 and does not skip levels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const outline = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) => ({
        level: Number.parseInt(heading.tagName.slice(1), 10),
        tagName: heading.tagName,
        text: heading.textContent?.trim() ?? '',
      }))

      const skipped = headings.flatMap((heading, index) => {
        if (index === 0) return []
        const previous = headings[index - 1]
        return heading.level > previous.level + 1 ? [`${previous.tagName}->${heading.tagName}:${heading.text}`] : []
      })

      const sectionHeadings = Array.from(document.querySelectorAll('main > section')).map((section) => {
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6')
        return heading?.tagName ?? null
      })

      return {
        emptyHeadings: headings.filter((heading) => heading.text.length === 0),
        h1Count: headings.filter((heading) => heading.tagName === 'H1').length,
        sectionHeadings,
        skipped,
      }
    })

    expect(outline.emptyHeadings).toEqual([])
    expect(outline.h1Count).toBe(1)
    expect(outline.sectionHeadings[0]).toBe('H1')
    expect(outline.sectionHeadings.slice(1)).toEqual(
      Array.from({ length: Math.max(outline.sectionHeadings.length - 1, 0) }, () => 'H2')
    )
    expect(outline.skipped).toEqual([])
  })

  test('homepage hero and portfolio images use descriptive alt text', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('img', { name: /sunrise over the london skyline for local handyman services/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /bedroom refurbishment in southwark, before work begins/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /bedroom refurbishment in southwark, after completion/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /staircase refurbishment in colindale, before work begins/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /staircase refurbishment in colindale, after completion/i })).toBeVisible()
  })

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
    await expect(focused).toHaveAttribute('id', 'main-content')
    await expect(focused).toHaveJSProperty('tagName', 'MAIN')
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
      { textPattern: /Pat Of All Trades/, href: '/' },
      { textPattern: /^Services$/, href: '/#services' },
      { textPattern: /^Portfolio$/, href: '/#portfolio' },
      { textPattern: /^About$/, href: '/#about' },
      { textPattern: /^Testimonials$/, href: '/#testimonials' },
      { textPattern: /^Get a Quote$/, href: '/#contact' },
    ] as const

    const firstStep = sequence[0]
    const remainingSteps = sequence.slice(1)

    await expect(focused).toHaveAttribute('href', firstStep.href)
    await expect(focused).toHaveAccessibleName(/Pat Of All Trades/)

    for (const step of remainingSteps) {
      await page.keyboard.press('Tab')
      await expect(focused).toHaveAttribute('href', step.href)
      await expect(focused).toHaveText(step.textPattern)
    }

    await test.step('primary nav axe sweep', async () => {
      const results = await new AxeBuilder({ page })
        .include('header')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      expect(results.violations).toEqual([])
    })
  })
})

test.describe('Reduced motion experience', () => {
  test('reduced motion media query disables animated affordances', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const activeMotionTokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement)
      return {
        fast: styles.getPropertyValue('--motion-duration-fast-active').trim(),
        base: styles.getPropertyValue('--motion-duration-base-active').trim(),
        slow: styles.getPropertyValue('--motion-duration-slow-active').trim(),
        emphasis: styles.getPropertyValue('--motion-duration-emphasis-active').trim(),
      }
    })
    expect(Object.values(activeMotionTokens).every((value) => value === '0s' || value === '0ms')).toBeTruthy()

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
      expect(innerPadding).toBeGreaterThanOrEqual(4)
    } finally {
      await context.close()
    }
  })
})
