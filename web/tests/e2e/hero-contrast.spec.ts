import { expect, test } from '@playwright/test'

const MIN_CONTRAST = 4.5

test.describe('Hero contrast @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => {
      const img = document.querySelector('img[alt="Handyman hero background"]') as HTMLImageElement | null
      return Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0)
    })
  })

  test('hero heading and subtitle meet WCAG contrast', async ({ page }) => {
    const heroHeading = page.getByRole('heading', { level: 1, name: /london's premier handyman/i })
    const heroSubtitle = page.getByText(/reliable\. professional\. unmatched quality\./i)

    await expect(heroHeading).toBeVisible()
    await expect(heroSubtitle).toBeVisible()

    const accessibilityTree = await page.accessibility.snapshot()
    const accessibilitySnapshot = JSON.stringify(accessibilityTree, null, 2)
    expect(accessibilitySnapshot).toMatchSnapshot('hero-accessibility.json')

    const contrastOf = async (locator: import('@playwright/test').Locator) => {
      return locator.evaluate(element => {
        const toLinear = (channel: number): number => {
          const normalized = channel / 255
          return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
        }

        const luminance = (r: number, g: number, b: number): number => {
          return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
        }

        const parseCssColor = (cssColor: string): [number, number, number, number] => {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = 1
          const ctx = canvas.getContext('2d')!
          ctx.clearRect(0, 0, 1, 1)
          ctx.fillStyle = cssColor
          ctx.fillRect(0, 0, 1, 1)
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data as unknown as [number, number, number, number]
          return [r, g, b, a / 255]
        }

        const clamp01 = (value: number): number => Math.min(0.999999, Math.max(0, value))

        const textRgb = parseCssColor(getComputedStyle(element).color)

        const rect = element.getBoundingClientRect()
        const sampleX = rect.left + rect.width / 2
        const sampleY = rect.top + rect.height / 2

        const heroImage = document.querySelector('img[alt="Handyman hero background"]') as HTMLImageElement | null
        if (!heroImage || !heroImage.naturalWidth || !heroImage.naturalHeight) {
          throw new Error('Hero image is not ready for sampling')
        }

        const imageRect = heroImage.getBoundingClientRect()
        if (imageRect.width === 0 || imageRect.height === 0) {
          throw new Error('Hero image has zero-sized client rect')
        }

        const scale = Math.max(imageRect.width / heroImage.naturalWidth, imageRect.height / heroImage.naturalHeight)
        const displayedWidth = heroImage.naturalWidth * scale
        const displayedHeight = heroImage.naturalHeight * scale
        const offsetX = (displayedWidth - imageRect.width) / 2
        const offsetY = (displayedHeight - imageRect.height) / 2

        const normalizedX = clamp01((sampleX - imageRect.left + offsetX) / displayedWidth)
        const normalizedY = clamp01((sampleY - imageRect.top + offsetY) / displayedHeight)

        const canvas = document.createElement('canvas')
        canvas.width = heroImage.naturalWidth
        canvas.height = heroImage.naturalHeight
        const ctx = canvas.getContext('2d')!
        const computedFilter = getComputedStyle(heroImage).filter
        ctx.filter = computedFilter && computedFilter !== 'none' ? computedFilter : 'none'
        ctx.drawImage(heroImage, 0, 0, heroImage.naturalWidth, heroImage.naturalHeight)
        const pixel = ctx.getImageData(
          Math.round(normalizedX * (heroImage.naturalWidth - 1)),
          Math.round(normalizedY * (heroImage.naturalHeight - 1)),
          1,
          1,
        ).data

        let backgroundRgb: [number, number, number] = [pixel[0], pixel[1], pixel[2]]

        const overlay = document.querySelector('[data-testid="hero-overlay"]') as HTMLElement | null
        if (overlay) {
          const [or, og, ob, oa] = parseCssColor(getComputedStyle(overlay).backgroundColor)
          const alpha = clamp01(oa)
          backgroundRgb = [
            or * alpha + backgroundRgb[0] * (1 - alpha),
            og * alpha + backgroundRgb[1] * (1 - alpha),
            ob * alpha + backgroundRgb[2] * (1 - alpha),
          ]
        }

        const textLuminance = luminance(textRgb[0], textRgb[1], textRgb[2])
        const backgroundLuminance = luminance(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2])

        const lighter = Math.max(textLuminance, backgroundLuminance)
        const darker = Math.min(textLuminance, backgroundLuminance)
        return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2))
      })
    }

    const headingContrast = await contrastOf(heroHeading)
    expect(headingContrast).toBeGreaterThanOrEqual(MIN_CONTRAST)

    const subtitleContrast = await contrastOf(heroSubtitle)
    expect(subtitleContrast).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})
