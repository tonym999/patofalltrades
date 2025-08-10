import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('hero renders and image is visible', async ({ page }) => {
    const heroImg = page.getByRole('img', { name: 'Handyman hero background' })
    await expect(heroImg).toBeVisible()
  })

  test('floating tools are decorative (aria-hidden)', async ({ page }) => {
    const decorative = page.getByTestId('decorative-icon')
    const count = await decorative.count()
    expect(count).toBeGreaterThan(0)
    const allHidden = await decorative.evaluateAll(nodes => nodes.every(n => n.getAttribute('aria-hidden') === 'true'))
    expect(allHidden).toBe(true)
  })
})


