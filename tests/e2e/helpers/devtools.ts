import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/** Exercises the real host and Pacer plugin rather than a standalone panel. */
export async function expectPacerDevtools(
  page: Page,
  trigger: () => Promise<void>,
  utilityKey: string,
) {
  // Keep example controls visible above the open dock.
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page
    .getByRole('button', { name: 'Open TanStack Devtools', exact: true })
    .click()
  const panel = page.locator('[id^="plugin-container-tanstack-pacer-"]')
  await expect(panel).toHaveCount(1)
  await expect(panel.getByText('TanStack Pacer', { exact: true })).toBeVisible()
  await trigger()
  await expect(panel.getByText(utilityKey, { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: 'Close TanStack Devtools', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Open TanStack Devtools', exact: true })
    .click()
  await expect(panel).toHaveCount(1)
  await trigger()
  await expect(panel.getByText(utilityKey, { exact: true })).toBeVisible()
}
