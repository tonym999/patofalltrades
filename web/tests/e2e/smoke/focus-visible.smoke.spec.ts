import { expect, test, type Locator } from '@playwright/test'

async function expectVisibleFocusIndicator(locator: Locator, label: string) {
  const focusSignal = await locator.evaluate((element) => {
    const styles = getComputedStyle(element)
    const outlineWidth = Number.parseFloat(styles.outlineWidth || '0')
    const hasOutline = Number.isFinite(outlineWidth) && outlineWidth > 0 && styles.outlineStyle !== 'none'
    const boxShadow = (styles.boxShadow || '').trim().toLowerCase()
    return {
      hasOutline,
      hasShadow: boxShadow !== '' && boxShadow !== 'none',
    }
  })

  expect(
    focusSignal.hasOutline || focusSignal.hasShadow,
    `${label} should show a visible keyboard focus indicator`,
  ).toBeTruthy()
}

test.describe('Smoke Test - keyboard focus visibility', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('desktop primary actions expose visible focus states @smoke', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await page.focus('body')

    const sequence = [
      {
        label: 'Skip link',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '#main-content')
        },
      },
      {
        label: 'Header logo',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '/')
        },
      },
      {
        label: 'Services nav link',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '/#services')
        },
      },
      {
        label: 'Portfolio nav link',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '/#portfolio')
        },
      },
      {
        label: 'About nav link',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '/#about')
        },
      },
      {
        label: 'Testimonials nav link',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '/#testimonials')
        },
      },
      {
        label: 'Header quote CTA',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '/#contact')
        },
      },
      {
        label: 'Hero portfolio CTA',
        locator: page.locator(':focus'),
        assertion: async () => {
          await expect(page.locator(':focus')).toHaveAttribute('href', '#portfolio')
        },
      },
    ] as const

    for (const step of sequence) {
      await page.keyboard.press('Tab')
      await step.assertion()
      await expectVisibleFocusIndicator(step.locator, step.label)
    }
  })
})
