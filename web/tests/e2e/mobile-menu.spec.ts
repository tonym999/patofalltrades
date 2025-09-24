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

  test('drawer respects safe-area padding', async ({ page }) => {
    const menuBtn = page.getByTestId('header-hamburger')
    await expect(menuBtn).toBeVisible({ timeout: 10000 })
    await menuBtn.click()

    const panel = page.locator('#mobile-menu-panel')
    await expect(panel).toBeVisible()

    const paddingBottom = await panel.evaluate((el) => {
      const pb = getComputedStyle(el).paddingBottom || '0px'
      return Number.parseFloat(pb.toString())
    })
    expect(paddingBottom).toBeGreaterThanOrEqual(12)

    const inner = page.getByTestId('mobile-menu-content')
    const paddingLeft = await inner.evaluate((el) => {
      const pl = getComputedStyle(el).paddingLeft || '0px'
      return Number.parseFloat(pl.toString())
    })
    const paddingRight = await inner.evaluate((el) => {
      const pr = getComputedStyle(el).paddingRight || '0px'
      return Number.parseFloat(pr.toString())
    })

    expect(paddingLeft).toBeGreaterThanOrEqual(16)
    expect(paddingRight).toBeGreaterThanOrEqual(16)
  })

  test('header safe-area padding resolves via computed style', async ({ page }) => {
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()
    const computed = await header.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        top: {
          raw: style.getPropertyValue('padding-top'),
          value: parseFloat(style.paddingTop || '0'),
        },
        left: {
          raw: style.getPropertyValue('padding-left'),
          value: parseFloat(style.paddingLeft || '0'),
        },
        right: {
          raw: style.getPropertyValue('padding-right'),
          value: parseFloat(style.paddingRight || '0'),
        },
      }
    })

    expect(Number.isFinite(computed.top.value)).toBeTruthy()
    expect(Number.isFinite(computed.left.value)).toBeTruthy()
    expect(Number.isFinite(computed.right.value)).toBeTruthy()
    expect(computed.top.value).toBeGreaterThanOrEqual(0)
    expect(computed.left.value).toBeGreaterThanOrEqual(0)
    expect(computed.right.value).toBeGreaterThanOrEqual(0)
    expect(computed.top.raw.trim()).toMatch(/px$/)
    expect(computed.left.raw.trim()).toMatch(/px$/)
    expect(computed.right.raw.trim()).toMatch(/px$/)
  })
})
