import { test, expect } from '@playwright/test'

test.describe('Smoke Test - Theme palette', () => {
  test('exposes CSS variables and applies them to the layout shell @smoke', async ({ page }) => {
    await page.goto('/')
    await page.accessibility.snapshot()

    const rootTokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement)
      return {
        background: styles.getPropertyValue('--background').trim(),
        foreground: styles.getPropertyValue('--foreground').trim(),
        hCta: styles.getPropertyValue('--h-cta').trim(),
        hTabs: styles.getPropertyValue('--h-tabs').trim(),
        zCta: styles.getPropertyValue('--z-cta').trim(),
        zTabs: styles.getPropertyValue('--z-tabs').trim(),
        zDrawer: styles.getPropertyValue('--z-drawer').trim(),
        motionBase: styles.getPropertyValue('--motion-duration-base-active').trim(),
      }
    })
    expect(rootTokens.background).toBe('224 28% 14%')
    expect(rootTokens.foreground).toBe('0 0% 100%')
    expect(rootTokens.hCta).toBe('56px')
    expect(rootTokens.hTabs).toBe('44px')
    expect(rootTokens.zCta).toBe('50')
    expect(rootTokens.zTabs).toBe('40')
    expect(rootTokens.zDrawer).toBe('100')
    expect(['300ms', '.3s', '0.3s']).toContain(rootTokens.motionBase)

    const bodyTextColor = await page.evaluate(() => getComputedStyle(document.body).color)
    expect(bodyTextColor).toBe('rgb(255, 255, 255)')

    const bodyBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundImage)
    expect(bodyBackground).toContain('linear-gradient')
  })
})
