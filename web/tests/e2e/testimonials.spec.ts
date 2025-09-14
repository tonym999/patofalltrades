import { test, expect } from '@playwright/test'

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

    // Click the second dot (index 1) and ensure it activates and changes text
    const dot1 = page.getByTestId('testimonial-dot-1')
    await dot1.click()
    await expect(dot1).toHaveAttribute('aria-current', 'true')

    // Quote should remain meaningful text
    await expect(quote).toHaveText(/.{11,}/)

    // Verify autoplay is paused for at least 5s after manual interaction
    await page.waitForTimeout(5500)
    // Autoplay paused: active remains on dot1
    await expect(dot1).toHaveAttribute('aria-current', 'true')

    // Keyboard navigation (ArrowRight) should move to next testimonial
    await section.focus()
    await page.keyboard.press('ArrowRight')
    // Navigation moves to a different testimonial
    await expect(dot1).not.toHaveAttribute('aria-current', 'true')

    // A11y: active dot has aria-current and stars have accessible label
    const activeDot = page.locator('[role="tab"][aria-current="true"]').first()
    await expect(activeDot).toBeVisible()

    const stars = page.locator('[role="img"][data-testid="star-rating"]').first()
    await expect(stars).toBeVisible()
    // Accessible label should match rounded rating and max handling
    const aria = await stars.getAttribute('aria-label')
    expect(aria).toMatch(/Rated \d+ out of 5/)
  })
})


