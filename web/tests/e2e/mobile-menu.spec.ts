import { test, expect, devices } from '@playwright/test'
import { ensureMobile } from './utils/ensureMobile'

test.use({ ...devices['iPhone 12'] })

test.describe('Mobile bottom sheet Menu', () => {
  // uses shared ensureMobile util

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await ensureMobile(page)
  })

  test('opens and closes via button and backdrop @smoke', async ({ page }) => {
    const menuBtn = page.getByTestId('header-hamburger')
    await expect(menuBtn).toBeVisible({ timeout: 10000 })
    await expect(menuBtn).toHaveAccessibleName(/menu/i)
    await menuBtn.click()
    const dialog = page.getByRole('dialog', { name: 'Menu' })
    await expect(dialog).toBeVisible()
    // Close via backdrop
    await page.getByTestId('menu-overlay').click({ position: { x: 10, y: 10 } })
    await expect(dialog).toBeHidden()
    await expect(menuBtn).toBeFocused()
  })

  test('Escape closes and returns focus', async ({ page }) => {
    const menuBtn = page.getByTestId('header-hamburger')
    await expect(menuBtn).toBeVisible({ timeout: 10000 })
    await expect(menuBtn).toHaveAccessibleName(/menu/i)
    await menuBtn.click()
    const dialog = page.getByRole('dialog', { name: 'Menu' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(menuBtn).toBeFocused()
  })

  test('shows all expected items', async ({ page }) => {
    const menuBtn = page.getByTestId('header-hamburger')
    await expect(menuBtn).toBeVisible({ timeout: 10000 })
    await expect(menuBtn).toHaveAccessibleName(/menu/i)
    await menuBtn.click()
    const dialog = page.getByRole('dialog', { name: 'Menu' })
    const items = ['Services', 'Work', 'Areas We Serve', 'About', 'Reviews', 'Get in Touch']
    for (const label of items) {
      await expect(dialog.getByRole('link', { name: label })).toBeVisible()
    }
  })

  test('Get in Touch scrolls and focuses name input', async ({ page }) => {
    const menuBtn = page.getByTestId('header-hamburger')
    await expect(menuBtn).toBeVisible({ timeout: 10000 })
    await expect(menuBtn).toHaveAccessibleName(/menu/i)
    await menuBtn.click()
    const getInTouch = page.getByRole('link', { name: 'Get in Touch' })
    await getInTouch.click()
    const nameInput = page.locator('#name')
    await expect(nameInput).toBeFocused()
    await expect(page).toHaveURL(/#contact$/)
  })
})


