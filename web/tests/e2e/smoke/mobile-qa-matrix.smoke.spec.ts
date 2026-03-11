import AxeBuilder from '@axe-core/playwright'
import { test, expect, devices, type Page } from '@playwright/test'
import { CONTACT_INFO } from '../../../config/contact'
import { ensureMobile } from '../utils/ensureMobile'

type MatrixProfile = {
  name: string
  use: Parameters<typeof test.use>[0]
}

function withoutDefaultBrowserType(
  options: typeof devices['iPhone 12']
): Parameters<typeof test.use>[0] {
  const { defaultBrowserType: _defaultBrowserType, ...rest } = options
  return rest
}

const MOBILE_QA_MATRIX: MatrixProfile[] = [
  {
    name: 'iPhone 12',
    use: withoutDefaultBrowserType(devices['iPhone 12']),
  },
  {
    name: 'Pixel 5',
    use: withoutDefaultBrowserType(devices['Pixel 5']),
  },
  {
    name: '320px narrow',
    use: {
      viewport: { width: 320, height: 640 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    },
  },
  {
    name: 'Tall viewport',
    use: {
      viewport: { width: 430, height: 932 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    },
  },
]

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(1)
}

for (const profile of MOBILE_QA_MATRIX) {
  test.describe(`Smoke @smoke - Mobile QA matrix (${profile.name})`, () => {
    test.use(profile.use)

    test('drawer and primary CTA flow stay operable', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('load')
      await ensureMobile(page)

      await expectNoHorizontalOverflow(page)

      const hamburger = page.getByTestId('header-hamburger')
      await expect(hamburger).toBeVisible()
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false')

      const ctaBar = page.getByTestId('mobile-cta-bar')
      await expect(ctaBar).toBeVisible()

      const ctaLinks = ctaBar.getByTestId('mobile-cta-link')
      await expect(ctaLinks).toHaveCount(2)

      const callLink = ctaBar.locator('[data-testid="mobile-cta-link"][data-action="call"]')
      await expect(callLink).toHaveAttribute('href', `tel:${CONTACT_INFO.phoneE164}`)

      const getQuote = ctaBar.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')
      const quoteBox = await getQuote.boundingBox()
      expect(quoteBox).not.toBeNull()
      expect(quoteBox!.height).toBeGreaterThanOrEqual(44)
      expect(quoteBox!.x + quoteBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width)

      await hamburger.click()
      const dialog = page.getByRole('dialog', { name: 'Menu' })
      await expect(dialog).toBeVisible()
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true')

      const menuAxe = await new AxeBuilder({ page })
        .include('#mobile-menu-panel')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      expect(menuAxe.violations).toEqual([])

      await page.getByTestId('menu-overlay').click({ position: { x: 8, y: 8 } })
      await expect(dialog).toBeHidden()
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false')
      await expect(hamburger).toBeFocused()

      await hamburger.click()
      await expect(dialog).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(hamburger).toBeFocused()

      await getQuote.click()
      await expect(page).toHaveURL(/#contact$/)
      await expect
        .poll(async () => page.evaluate(() => document.activeElement?.id ?? ''))
        .toBe('name')
      await expect(ctaBar).toBeHidden()

      await page.evaluate(() => {
        ;(document.activeElement as HTMLElement | null)?.blur?.()
      })

      await expect(ctaBar).toBeVisible()
      await expectNoHorizontalOverflow(page)
    })
  })
}
