import { test, expect } from '@playwright/test'

test.describe('Testimonials', () => {
  test('renders and supports navigation and autoplay pause', async ({ page }) => {
    await page.goto('/')

    // Scroll into view
    const section = page.locator('#testimonials')
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()

    const quote = page.getByTestId('testimonial-quote')
    await expect(quote).toBeVisible()
    const initial = await quote.textContent()
    expect(initial && initial.length > 10).toBeTruthy()

    // Click on dot 2 (index 1) and ensure it activates and changes text
    const dot1 = page.getByTestId('testimonial-dot-1')
    await dot1.click()
    await expect(dot1).toHaveAttribute('aria-current', 'true')

    await expect.poll(async () => (await quote.textContent()) || '').not.toBe(initial)
    const afterClick = await quote.textContent()

    // Verify autoplay is paused for at least 5s after manual interaction
    await page.waitForTimeout(5500)
    const stillSame = await quote.textContent()
    expect(stillSame).toBe(afterClick)

    // Keyboard navigation (ArrowRight) should move to next testimonial
    await section.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => (await quote.textContent()) || '').not.toBe(stillSame)
    const afterKey = await quote.textContent()

    // A11y: active dot has aria-current and stars have accessible label
    const activeDot = page.locator('[role="tab"][aria-current="true"]').first()
    await expect(activeDot).toBeVisible()

    const stars = page.locator('[role="img"][aria-label*="out of 5"]')
    await expect(stars.first()).toBeVisible()
  })
})


