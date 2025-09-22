import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test.describe('Testimonials', () => {
  test('renders and supports navigation and autoplay pause', async ({ page }) => {
    await page.goto('/')
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    // Scroll into view
    const section = page.locator('#testimonials')
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()

    const quote = page.getByTestId('testimonial-quote')
    await expect(quote).toBeVisible()
    await expect(quote).toHaveText(/.{11,}/)
    const initialText = await quote.innerText()

    // Click the second dot (index 1) and ensure it activates and changes text
    const dot1 = page.getByTestId('testimonial-dot-1')
    await dot1.click()
    await expect(dot1).toHaveAttribute('aria-selected', 'true')
    await expect(dot1).toHaveAttribute('tabindex', '0')

    // Changed: ensure text differs from initial
    await expect(quote).not.toHaveText(initialText)

    // Verify autoplay is paused for at least 5s after manual interaction
    // eslint-disable-next-line playwright/no-wait-for-timeout -- explicit pause duration is part of the spec
    await page.waitForTimeout(5100)
    // Autoplay paused: active remains on dot1
    await expect(dot1).toHaveAttribute('aria-selected', 'true')

    // Keyboard navigation (ArrowRight) should move to next testimonial
    await dot1.focus()
    await page.keyboard.press('ArrowRight')
    // Navigation moves to the next testimonial (dot2)
    const dot2 = page.getByTestId('testimonial-dot-2')
    await expect(dot2).toHaveAttribute('aria-selected', 'true')
    await expect(dot2).toBeFocused()
    await expect(dot1).toHaveAttribute('aria-selected', 'false')

    // A11y: active dot exposes aria-selected and stars have accessible label
    const activeDot = page.locator('[role="tab"][aria-selected="true"]').first()
    await expect(activeDot).toBeVisible()

    const stars = page.locator('[role="img"][data-testid="star-rating"]').first()
    await expect(stars).toBeVisible()
    // Accessible label should match rounded rating and max handling
    const aria = await stars.getAttribute('aria-label')
    expect(aria).toMatch(/Rated \d+ out of 5/)
    // A11y: Axe scan scoped to testimonials section
    const results = await new AxeBuilder({ page }).include('#testimonials').analyze()
    expect(results.violations).toHaveLength(0)
  })
})


