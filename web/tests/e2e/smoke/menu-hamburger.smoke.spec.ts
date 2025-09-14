import { test, expect } from '@playwright/test'

test.describe('Smoke @smoke - Top hamburger opens bottom-sheet menu', () => {
  test('Header hamburger opens the mobile menu and it can be closed', async ({ page }) => {
    await page.goto('/')

    // Ensure header is visible and hamburger exists on mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })
    const hamburger = page.getByTestId('header-hamburger')
    await expect(hamburger).toBeVisible()

    // Open
    await hamburger.click()
    const dialog = page.locator('#mobile-menu-panel')
    await expect(dialog).toBeVisible()

    // Basic a11y snapshot (non-asserting, but ensures no crash)
    await page.accessibility.snapshot()

    // Close via overlay click
    const overlay = page.getByTestId('menu-overlay')
    await overlay.click({ position: { x: 5, y: 5 } })
    await expect(dialog).toBeHidden()
  })
})


