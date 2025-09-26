import { test, expect } from '@playwright/test'
import type { AXNode } from '@playwright/test'

const hasMainRegion = (node?: AXNode | null): boolean => {
  if (!node) return false
  if (node.role === 'main') {
    const name = (node.name ?? '').toLowerCase()
    if (!name || name.includes('main')) return true
  }
  return (node.children ?? []).some((child) => hasMainRegion(child))
}

test.describe('Smoke @smoke - Skip navigation', () => {
  test('activating skip link focuses main and captures a11y snapshot @smoke', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.focus('body')
    await page.keyboard.press('Tab')

    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')

    const main = page.locator('main#main-content')
    await expect(main).toBeFocused()
    const currentUrl = new URL(page.url())
    expect(currentUrl.hash).toBe('#main-content')
    expect(currentUrl.pathname).toBe('/')
    expect(currentUrl.search).toBe('')

    await test.step('capture a11y tree', async () => {
      const ax = await page.accessibility.snapshot()
      expect(ax).toBeTruthy()
      expect(hasMainRegion(ax)).toBeTruthy()
    })
  })
})
