import { test, expect, devices } from '@playwright/test'
import { ensureMobile } from '../utils/ensureMobile'

const mobileProfiles = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'Pixel 7', device: devices['Pixel 7'] },
]

test.describe('Mobile keyboard-safe layout', () => {
  for (const profile of mobileProfiles) {
    test(`${profile.name} hides sticky CTA while a form field is focused`, async ({ browser }) => {
      const context = await browser.newContext(profile.device)

      try {
        const page = await context.newPage()
        await page.goto('/')
        await page.waitForLoadState('load')
        await ensureMobile(page)

        const bar = page.getByTestId('mobile-cta-bar')
        const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')

        await expect(bar).toBeVisible()
        await getQuote.click()

        await expect.poll(async () => page.evaluate(() => document.activeElement?.id ?? '')).toBe('name')
        await expect(bar).toBeHidden()

        const scrollWhileFocused = await page.evaluate(() => window.scrollY)
        await page.evaluate(() => {
          ;(document.activeElement as HTMLElement | null)?.blur?.()
        })

        await expect(bar).toBeVisible()

        const scrollAfterBlur = await page.evaluate(() => window.scrollY)
        expect(Math.abs(scrollAfterBlur - scrollWhileFocused)).toBeLessThanOrEqual(8)
      } finally {
        await context.close()
      }
    })
  }
})
