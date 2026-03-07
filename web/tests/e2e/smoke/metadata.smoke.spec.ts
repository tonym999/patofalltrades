import { expect, test } from '@playwright/test'

test.describe('Smoke @smoke - Metadata and manifest', () => {
  test('homepage exposes expected social metadata', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Quality craftsmanship delivered across London. From small repairs to complete renovations — professional handyman services you can rely on.',
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Pat Of All Trades | Premium London Handyman Services',
    )
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'Quality craftsmanship delivered across London. From small repairs to complete renovations — professional handyman services you can rely on.',
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://patofalltrades.co.uk/og-image.jpg',
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'Pat Of All Trades | Premium London Handyman Services',
    )
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      'Quality craftsmanship delivered across London. From small repairs to complete renovations — professional handyman services you can rely on.',
    )
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://patofalltrades.co.uk/social-share.jpg',
    )
  })

  test('site manifest exposes expected brand metadata', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/site.webmanifest`)
    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toContain('application/manifest+json')

    const manifest = await response.json()
    expect(manifest).toMatchObject({
      name: 'Pat of All Trades',
      short_name: 'PAT',
      start_url: '/',
      scope: '/',
      theme_color: '#1a1f2e',
      background_color: '#1a1f2e',
      display: 'standalone',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    })
  })
})
