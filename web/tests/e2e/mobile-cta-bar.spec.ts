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

	test('uses the dark theme surface and gold-accent button styling', async ({ page }) => {
		const nav = page.getByTestId('mobile-cta-bar')
		await expect(nav).toBeVisible()
		const navStyles = await nav.evaluate((el) => {
			const cs = getComputedStyle(el)
			return {
				backgroundColor: cs.backgroundColor,
				borderTopColor: cs.borderTopColor,
			}
		})
		expect(navStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
		expect(navStyles.backgroundColor).not.toBe('rgb(255, 255, 255)')
		expect(navStyles.borderTopColor).not.toBe('rgb(255, 255, 255)')

		const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
		const whatsapp = page.locator('[data-testid="mobile-cta-link"][data-action="whatsapp"]')
		const getQuote = page.locator('[data-testid="mobile-cta-link"][data-action="get-quote"]')

		const [neutralStyles, whatsappStyles, quoteStyles] = await Promise.all([
			call.evaluate((el) => {
				const cs = getComputedStyle(el)
				return {
					color: cs.color,
					backgroundColor: cs.backgroundColor,
				}
			}),
			whatsapp.evaluate((el) => {
				const cs = getComputedStyle(el)
				return {
					color: cs.color,
					backgroundColor: cs.backgroundColor,
				}
			}),
			getQuote.evaluate((el) => {
				const cs = getComputedStyle(el)
				return {
					color: cs.color,
					backgroundColor: cs.backgroundColor,
				}
			}),
		])

		expect(neutralStyles.color).not.toBe('rgb(15, 23, 42)')
		expect(neutralStyles.color).not.toBe('rgb(255, 255, 255)')
		expect(neutralStyles.color).not.toBe('rgb(6, 78, 59)')
		expect(neutralStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

		expect(whatsappStyles.color).not.toBe('rgb(6, 78, 59)')
		expect(whatsappStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

		expect(quoteStyles.color).toBe('rgb(15, 23, 42)')
		expect(quoteStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
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
				const composite = (
					foreground: [number, number, number, number],
					background: [number, number, number, number]
				): [number, number, number, number] => {
					const alpha = foreground[3] + background[3] * (1 - foreground[3])
					if (alpha === 0) return [0, 0, 0, 0]
					const r = ((foreground[0] * foreground[3]) + (background[0] * background[3] * (1 - foreground[3]))) / alpha
					const g = ((foreground[1] * foreground[3]) + (background[1] * background[3] * (1 - foreground[3]))) / alpha
					const b = ((foreground[2] * foreground[3]) + (background[2] * background[3] * (1 - foreground[3]))) / alpha
					return [r, g, b, alpha]
				}

				const resolveBackground = (start: Element): [number, number, number, number] => {
					let bg: [number, number, number, number] = [255,255,255,0]
					let node: Element | null = start
					while (node) {
						const rgba = getRGB(getComputedStyle(node).backgroundColor)
						bg = composite(rgba, bg)
						if (bg[3] >= 0.999) {
							return [bg[0], bg[1], bg[2], 1]
						}
						node = (node as HTMLElement).parentElement
					}
					return composite(bg, [255,255,255,1])
				}

				const text = getRGB(getComputedStyle(el).color)
				const bg = resolveBackground(el)
				const Ltext = luminance(text[0], text[1], text[2])
				const Lbg = luminance(bg[0], bg[1], bg[2])
				const lighter = Math.max(Ltext, Lbg)
				const darker = Math.min(Ltext, Lbg)
				return (lighter + 0.05) / (darker + 0.05)
			})
		}

		const call = page.getByRole('link', { name: 'Call' })
		const callContrast = await contrastOf(call)
		expect(callContrast).toBeGreaterThanOrEqual(4.5)

		const whatsapp = page.getByRole('link', { name: 'WhatsApp' })
		const whatsappContrast = await contrastOf(whatsapp)
		expect(whatsappContrast).toBeGreaterThanOrEqual(4.5)

		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		const quoteContrast = await contrastOf(getQuote)
		expect(quoteContrast).toBeGreaterThanOrEqual(4.5)
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
			await expect(getQuote).toBeVisible()
			const quoteBox = await getQuote.boundingBox()
			expect(quoteBox).not.toBeNull()
			expect(quoteBox!.height).toBeGreaterThanOrEqual(44)
			const call = page.locator('[data-testid="mobile-cta-link"][data-action="call"]')
			await expect(call).toBeVisible()
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

})
