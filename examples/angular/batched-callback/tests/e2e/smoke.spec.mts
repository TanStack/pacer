import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectBatcher Example 1',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the log, analytics, and API request demos', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Batched analytics', exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Batched API requests', exact: true }),
  ).toBeVisible()
})

test('processes logs once the third entry fills the batch', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Log Entry', exact: true }).click()
  await page.getByRole('button', { name: 'Add Warning', exact: true }).click()
  await page.clock.runFor(32)
  await expect(
    page.getByText('Total Logs Created: 2, Logs Processed: 0', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Add Error', exact: true }).click()
  await page.clock.runFor(32)
  await expect(
    page.getByText('Total Logs Created: 3, Logs Processed: 3', { exact: true }),
  ).toBeVisible()
})
