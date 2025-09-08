import type { Page } from '@playwright/test'

export async function ensureMobile(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' })
}


