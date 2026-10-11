import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import type { Page } from '@playwright/test'

function valueInRow(page: Page, label: string) {
  return page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: label, exact: true }) })
    .getByRole('cell')
    .last()
}

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer debounce Example 1',
      exact: true,
    }),
  ).toBeVisible()
})

test('renders the counter, search, and range demos', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(3)
  await expect(
    page.getByRole('button', { name: 'Increment', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(page.getByRole('slider', { name: /Readonly/ })).toBeDisabled()
  await expect(page.getByRole('slider', { name: /Readonly/ })).toHaveValue('50')
})

test('coalesces repeated increments and restarts the debounce delay', async ({
  page,
}) => {
  const increment = page.getByRole('button', { name: 'Increment', exact: true })
  const output = valueInRow(page, 'Debounced Count:')
  await increment.click()
  await page.clock.runFor(300)
  await increment.click()
  await page.clock.runFor(300)
  await expect(output).toHaveText('0')
  await increment.click()
  await expect(valueInRow(page, 'Instant Count:')).toHaveText('3')
  await page.clock.runFor(499)
  await expect(output).toHaveText('0')
  await page.clock.runFor(1)
  await expect(output).toHaveText('3')
})
