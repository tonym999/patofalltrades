import { test, expect, devices, Page } from '@playwright/test'
import { CONTACT_INFO } from '../../config/contact'

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

	test('renders on mobile view and shows buttons @smoke', async ({ page }) => {
		const bar = page.getByRole('link', { name: 'Get Quote' })
		await expect(bar).toBeVisible()
		const call = page.getByRole('link', { name: 'Call' })
		await expect(call).toBeVisible()
	})

	test('tel link opens dialer scheme', async ({ page }) => {
		const call = page.getByRole('link', { name: 'Call' })
		await expect(call).toHaveAttribute('href', `tel:${CONTACT_INFO.phoneE164}`)
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
		// Check arbitrary property is applied on the padding container via test id
		const barContainer = page.getByTestId('mobile-cta-padding')
		const paddingBottom = await barContainer.evaluate(el => getComputedStyle(el).paddingBottom)
		const pb = Number.parseFloat((paddingBottom || '0px').toString())
		expect(pb).toBeGreaterThanOrEqual(12)
	})

	test('buttons meet WCAG 4.5:1 contrast', async ({ page }) => {
		async function contrastOf(locator: import('@playwright/test').Locator): Promise<number> {
			const styles = await locator.evaluate((el: Element) => {
				const re = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/i
				const parse = (s: string): [number, number, number, number] => {
					const m = s.match(re)
					return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] !== undefined ? Number(m[4]) : 1] : [0,0,0,0]
				}
				const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
				const composite = (over: [number,number,number,number], under: [number,number,number,number]): [number,number,number,number] => {
					const a = clamp01(over[3]) + clamp01(under[3]) * (1 - clamp01(over[3]))
					const r = Math.round((over[0] * over[3] + under[0] * under[3] * (1 - over[3])) / (a || 1))
					const g = Math.round((over[1] * over[3] + under[1] * under[3] * (1 - over[3])) / (a || 1))
					const b = Math.round((over[2] * over[3] + under[2] * under[3] * (1 - over[3])) / (a || 1))
					return [r,g,b,a]
				}
				// Build effective background under text by compositing ancestor backgrounds
				let node: Element | null = el as Element
				let bg: [number,number,number,number] = [255,255,255,1] // start with page white
				const stack: string[] = []
				while (node) {
					const s = getComputedStyle(node)
					stack.push(s.backgroundColor)
					node = (node as HTMLElement).parentElement
				}
				// Apply from root to element
				for (let i = stack.length - 1; i >= 0; i--) {
					const c = parse(stack[i])
					if (c[3] > 0) {
						bg = composite(c, bg)
					}
				}
				const color = parse(getComputedStyle(el).color)
				return { color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`, backgroundColor: `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})` }
			})
			const parseRgb = (s: string): [number, number, number] => {
				const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
				return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0]
			}
			const [cr, cg, cb] = parseRgb(styles.color)
			const [br, bg, bb] = parseRgb(styles.backgroundColor)
			const toLin = (v: number): number => {
				const x = v / 255
				return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
			}
			const lum = (r: number, g: number, b: number): number => 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
			const Ltext = lum(cr, cg, cb)
			const Lbg = lum(br, bg, bb)
			const lighter = Math.max(Ltext, Lbg)
			const darker = Math.min(Ltext, Lbg)
			return (lighter + 0.05) / (darker + 0.05)
		}

		const call = page.getByRole('link', { name: 'Call' })
		const callContrast = await contrastOf(call)
		expect(callContrast).toBeGreaterThanOrEqual(4.5)

		const getQuote = page.getByRole('link', { name: 'Get Quote' })
		const quoteContrast = await contrastOf(getQuote)
		expect(quoteContrast).toBeGreaterThanOrEqual(4.5)
	})
})
