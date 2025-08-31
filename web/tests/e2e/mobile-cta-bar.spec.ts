import { test, expect, devices, Page } from '@playwright/test'

test.use({ ...devices['iPhone 12'] })

test.describe('Mobile CTA Bar', () => {
	async function ensureMobile(page: Page) {
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
	}

	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('domcontentloaded')
		await ensureMobile(page)
	})

	test('renders on mobile view and shows buttons', async ({ page }) => {
		const bar = page.getByRole('link', { name: 'Get Quote' })
		await expect(bar).toBeVisible()
		const call = page.getByRole('link', { name: 'Call' })
		await expect(call).toBeVisible()
	})

	test('tel link opens dialer scheme', async ({ page }) => {
		const call = page.getByRole('link', { name: 'Call' })
		await expect(call).toHaveAttribute('href', /tel:\+447?123456789/) // E.164 number present
	})

	test('Get Quote scrolls to #contact and focuses first field', async ({ page }) => {
		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		await getQuote.click()
		// Wait a tick for focus to move
		const nameInput = page.locator('#name')
		await expect(nameInput).toBeFocused()
		// Hash should be #contact
		await expect(page).toHaveURL(/#contact$/)
	})

	test('buttons are at least 44px tall', async ({ page }) => {
		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		const box = await getQuote.boundingBox()
		expect(box?.height || 0).toBeGreaterThanOrEqual(44)
		const call = page.getByRole('link', { name: 'Call' })
		const box2 = await call.boundingBox()
		expect(box2?.height || 0).toBeGreaterThanOrEqual(44)
	})

	test('visible focus rings on keyboard focus', async ({ page }) => {
		// Move focus into document then tab to CTA links
		await page.focus('body')
		const call = page.getByRole('link', { name: 'Call' })
		await call.focus()
		await page.keyboard.press('Tab')
		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		await expect(getQuote).toBeFocused()
		// Tailwind ring utilities apply via box-shadow when :focus-visible
		const styles = await getQuote.evaluate(el => {
			const cs = getComputedStyle(el)
			return { outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow }
		})
		const outline = parseFloat((styles.outlineWidth || '0').toString())
		const hasShadow = !!styles.boxShadow && styles.boxShadow !== 'none'
		expect(outline > 0 || hasShadow).toBeTruthy()
	})

	test('respects safe-area bottom padding', async ({ page }) => {
		// Check arbitrary property is applied on the inner padding container (two levels up from link)
		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		const barContainer = getQuote.locator('xpath=ancestor::div[2]')
		const paddingBottom = await barContainer.evaluate(el => getComputedStyle(el).paddingBottom)
		expect(paddingBottom).not.toBe('0px')
	})
})
