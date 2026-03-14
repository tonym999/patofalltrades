import { test, expect } from '@playwright/test'

test.describe('Smoke @smoke - Desktop hero CTA regression', () => {
  test('Hero keeps View Portfolio as lone primary CTA', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    const hero = page.locator('main section').first()
    const heroImage = hero.getByRole('img', { name: 'Handyman hero background' })
    const imagePreloads = page.locator('head link[rel="preload"][as="image"]')
    const viewPortfolio = hero.getByRole('link', { name: 'View Portfolio' })

    await expect(heroImage).toBeVisible()
    await expect(heroImage).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 1440px')
    await expect(imagePreloads).toHaveCount(1)
    await expect(imagePreloads.first()).toHaveAttribute('imagesizes', '(max-width: 768px) 100vw, 1440px')
    await expect(imagePreloads.first()).toHaveAttribute('imagesrcset', /hero\..*\.(avif|webp)/)
    await expect(viewPortfolio).toBeVisible()

    const heroGetQuote = hero.getByRole('link', { name: 'Get a Quote' })
    await expect(heroGetQuote).toHaveCount(0)

    const headerQuote = page.locator('header').getByRole('link', { name: 'Get a Quote' })
    await expect(headerQuote.first()).toBeVisible()

    const ax = await page.accessibility.snapshot()
    expect(ax).toBeTruthy()
  })
})
