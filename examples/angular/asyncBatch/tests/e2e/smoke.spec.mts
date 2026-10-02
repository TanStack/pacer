import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer asyncBatch Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders empty asynchronous batch status', async ({ page }) => {
  await expect(page.getByText('Pending Items: 0 / 5', { exact: true })).toBeVisible()
  await expect(page.getByText('Is Processing: false', { exact: true })).toBeVisible()
})

test('an urgent item processes the current batch before the wait elapses', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Regular Item', exact: true }).click()
  await page.clock.runFor(32)
  await expect(page.getByRole('listitem')).toHaveText(['item-1'])
  await page
    .getByRole('button', {
      name: 'Add Urgent Item (Processes Immediately)',
      exact: true,
    })
    .click()
  await page.clock.runFor(32)
  await expect(page.getByText('Is Processing: true', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Processed Batches (0)', exact: true }),
  ).toBeVisible()
  await page.clock.runFor(1050)
  await expect(page.getByText('Processed 2 items: item-1, urgent-2', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Successful Batches: 1, Failed Batches: 0', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Is Processing: false', { exact: true })).toBeVisible()
})

test('reports and clears a simulated processing failure', async ({ page }) => {
  await page.evaluate(() => {
    Math.random = () => 0
  })
  await page
    .getByRole('checkbox', {
      name: 'Simulate random failures (30% chance)',
      exact: true,
    })
    .check()
  await page
    .getByRole('button', {
      name: 'Add Urgent Item (Processes Immediately)',
      exact: true,
    })
    .click()
  await page.clock.runFor(1050)
  await expect(page.getByRole('alert')).toContainText('Processing failed for batch with 1 items')
  await expect(
    page.getByText('Successful Batches: 0, Failed Batches: 1', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear Errors', exact: true }).click()
  await page.clock.runFor(32)
  await expect(page.getByRole('alert')).toHaveCount(0)
})
