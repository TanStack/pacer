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
  // Preact installs passive effects after the next animation frame.
  await page.clock.runFor(17)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer useRateLimiter Example 1',
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

test('rejects calls beyond the fixed-window limit and accepts calls after expiry', async ({
  page,
}) => {
  const increment = page.getByRole('button', { name: 'Increment', exact: true })
  const output = valueInRow(page, 'Rate Limited Count:')
  for (let count = 0; count < 6; count++) await increment.click()
  await expect(valueInRow(page, 'Instant Count:')).toHaveText('6')
  await expect(output).toHaveText('5')
  await page.clock.runFor(5001)
  await increment.click()
  await expect(output).toHaveText('7')
})

test('uses the selected sliding window to expire only the oldest calls', async ({
  page,
}) => {
  const increment = page.getByRole('button', { name: 'Increment', exact: true })
  const output = valueInRow(page, 'Rate Limited Count:')
  await page
    .getByRole('radio', { name: 'Sliding Window', exact: true })
    .first()
    .check()
  for (let count = 0; count < 5; count++) {
    await increment.click()
    await page.clock.runFor(1000)
  }
  await page.clock.runFor(1000)
  // Two old calls have expired. A fixed window would accept all three calls.
  await increment.click()
  await increment.click()
  await increment.click()
  await expect(output).toHaveText('7')
})
