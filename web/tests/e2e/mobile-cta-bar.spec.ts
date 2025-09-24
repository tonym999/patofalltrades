import { test, expect, devices } from '@playwright/test'
import { ensureMobile } from './utils/ensureMobile'
import { CONTACT_INFO, WHATSAPP_PRESET, whatsappHref } from '../../config/contact'

test.use({ ...devices['iPhone 12'] })

test.describe('Mobile CTA Bar', () => {

	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('domcontentloaded')
		await ensureMobile(page)
	})

	test('renders on mobile view and shows buttons @smoke', async ({ page }) => {
		const bar = page.getByRole('link', { name: 'Get Quote' })
		await expect(bar).toBeVisible()
		const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
		await expect(call).toBeVisible()
	})

	test('tel link opens dialer scheme', async ({ page }) => {
		const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
		await expect(call).toHaveAttribute('href', `tel:${CONTACT_INFO.phoneE164}`)
	})

	test('Get Quote scrolls to #contact and focuses first field', async ({ page }) => {
		const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')
		await expect(getQuote).toBeVisible()
		await getQuote.click()
		// Wait a tick for focus to move
		const nameInput = page.locator('#name')
		await expect(nameInput).toBeFocused()
		// Hash should be #contact
		await expect(page).toHaveURL(/#contact$/)
	})

		test('buttons are at least 44px tall', async ({ page }) => {
			const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')
			const quoteBox = await getQuote.boundingBox()
			expect(quoteBox).not.toBeNull()
			expect(quoteBox!.height).toBeGreaterThanOrEqual(44)
			const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
			const callBox = await call.boundingBox()
			expect(callBox).not.toBeNull()
			expect(callBox!.height).toBeGreaterThanOrEqual(44)
		})

		test('WhatsApp CTA opens chat in new tab with preset message', async ({ page }) => {
			const whatsapp = page.locator('[data-testid="mobile-cta-link"][data-action="whatsapp"]')
			await expect(whatsapp).toHaveAttribute('target', '_blank')
			await expect(whatsapp).toHaveAttribute('rel', /noopener/)
			await expect(whatsapp).toHaveAttribute('rel', /noreferrer/)
			const expectedHref = whatsappHref()
			await expect(whatsapp).toHaveAttribute('href', /wa\.me/)
			const resolvedHref = await whatsapp.evaluate((node, base) => {
				const href = node.getAttribute('href') ?? ''
				return new URL(href, base).toString()
			}, expectedHref)
			const expectedUrl = new URL(expectedHref)
			const actualUrl = new URL(resolvedHref)
			expect(actualUrl.origin).toBe(expectedUrl.origin)
			expect(actualUrl.pathname).toBe(expectedUrl.pathname)
			expect(actualUrl.searchParams.get('text')).toBe(expectedUrl.searchParams.get('text'))
			expect(actualUrl.searchParams.get('text')).toBe(WHATSAPP_PRESET)
		})

	test('visible focus rings on keyboard focus', async ({ page }) => {
		// Move focus into document then tab through CTA links
		await page.focus('body')
		const ctaLinks = page.getByTestId('mobile-cta-link')
		const call = ctaLinks.nth(0)
		await call.focus()
		await page.keyboard.press('Tab')
		const whatsapp = ctaLinks.nth(1)
		await expect(whatsapp).toBeFocused()
		await page.keyboard.press('Tab')
		const getQuote = ctaLinks.nth(2)
		await expect(getQuote).toBeFocused()
		// Tailwind ring utilities apply via box-shadow when :focus-visible
			const focusSignal = await getQuote.evaluate(el => {
				const cs = getComputedStyle(el)
				const outlineWidth = Number.parseFloat(cs.outlineWidth || '0')
				if (Number.isFinite(outlineWidth) && outlineWidth > 0) return 'outline'
				const boxShadow = (cs.boxShadow || '').trim().toLowerCase()
				if (boxShadow && boxShadow !== 'none') return 'shadow'
				return 'none'
			})
			expect(focusSignal).not.toBe('none')
		})

		test('respects safe-area bottom padding', async ({ page }) => {
		// Check safe-area padding via computed style rather than inline style text
		const barContainer = page.getByTestId('mobile-cta-padding')
		const paddingMetrics = await barContainer.evaluate(el => {
			const cs = getComputedStyle(el)
			return {
				paddingBottom: Number.parseFloat(cs.paddingBottom || '0'),
				resolved: cs.getPropertyValue('padding-bottom'),
			}
		})
		expect(Number.isFinite(paddingMetrics.paddingBottom)).toBeTruthy()
		expect(paddingMetrics.paddingBottom).toBeGreaterThanOrEqual(12)
		expect(paddingMetrics.resolved.trim()).toMatch(/px$/)
	})

	test('buttons meet WCAG 4.5:1 contrast', async ({ page }) => {
		async function contrastOf(locator: import('@playwright/test').Locator): Promise<number> {
			return locator.evaluate((el: Element) => {
				const toLin = (v: number): number => {
					const x = v / 255
					return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
				}
				const luminance = (r: number, g: number, b: number): number => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
				const getRGB = (cssColor: string): [number, number, number, number] => {
					const canvas = document.createElement('canvas')
					canvas.width = canvas.height = 1
					const ctx = canvas.getContext('2d')!
					ctx.clearRect(0,0,1,1)
					ctx.fillStyle = cssColor
					ctx.fillRect(0,0,1,1)
					const [r,g,b,a] = Array.from(ctx.getImageData(0,0,1,1).data) as [number, number, number, number]
					return [r,g,b,a/255]
				}
				// nearest non-transparent background
				let node: Element | null = el
				let bg: [number, number, number, number] = [255,255,255,1]
				while (node) {
					const c = getComputedStyle(node).backgroundColor
					const rgba = getRGB(c)
					if (rgba[3] > 0) { bg = [rgba[0], rgba[1], rgba[2], 1]; break }
					node = (node as HTMLElement).parentElement
				}
				const [cr,cg,cb] = getRGB(getComputedStyle(el).color)
				const Ltext = luminance(cr,cg,cb)
				const Lbg = luminance(bg[0], bg[1], bg[2])
				const lighter = Math.max(Ltext, Lbg)
				const darker = Math.min(Ltext, Lbg)
				return (lighter + 0.05) / (darker + 0.05)
			})
		}

		const call = page.getByRole('link', { name: 'Call' })
		const callContrast = await contrastOf(call)
		expect(callContrast).toBeGreaterThanOrEqual(4.5)

		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		const quoteContrast = await contrastOf(getQuote)
		expect(quoteContrast).toBeGreaterThanOrEqual(4.5)
	})
})
