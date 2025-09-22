import { test, expect } from '@playwright/test'

test.describe('Reduced motion preference', () => {
  test('removes dynamic scroll progress and shows counters without animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      document.body.style.minHeight = '300vh'
      document.documentElement.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })

    const progress = page.locator('[data-testid="scroll-progress"]')
    await expect(progress).toBeAttached()
    await expect(progress).toBeVisible()

    const readWidth = async () => {
      return await progress.evaluate((el) => el.getBoundingClientRect().width)
    }
    const waitForAnimationFrames = async () => {
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
      )
    }

    const initialWidth = await readWidth()

    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight / 2, behavior: 'auto' })
    })
    await waitForAnimationFrames()

    await expect.poll(async () => Math.abs((await readWidth()) - initialWidth), {
      message: 'scroll progress width should remain stable at mid scroll when motion is reduced',
      intervals: [75, 150, 225, 300],
      timeout: 2000,
    }).toBeLessThanOrEqual(0.5)

    await page.evaluate(() => {
      const doc = document.documentElement
      window.scrollTo({ top: doc.scrollHeight, behavior: 'auto' })
    })
    await waitForAnimationFrames()

    await expect.poll(async () => Math.abs((await readWidth()) - initialWidth), {
      message: 'scroll progress width should remain stable near bottom when motion is reduced',
      intervals: [75, 150, 225, 300],
      timeout: 2000,
    }).toBeLessThanOrEqual(0.5)

    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)

    const counters = page.locator('.counter')
    await expect(counters.nth(0)).toHaveText('10')
    await expect(counters.nth(1)).toHaveText('2500')
  })
})
