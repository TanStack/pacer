import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectAsyncBatchedCallback Example 1',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders all asynchronous batch demos', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(3)
  await expect(
    page.getByRole('heading', {
      name: 'Batched email validation',
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Batched data processing', exact: true }),
  ).toBeVisible()
})

test('returns two results per query when three searches fill the batch', async ({ page }) => {
  for (const query of ['javascript', 'react', 'typescript']) {
    await page.getByRole('button', { name: `Search "${query}"`, exact: true }).click()
  }
  await page.clock.runFor(32)
  await expect(page.getByText('Processing batch search...', { exact: true })).toBeVisible()
  await page.clock.runFor(850)
  await expect(
    page.getByText('Total Searches Made: 3, Results Found: 6, Batches Processed: 1', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(page.getByText('typescript: typescript result 2', { exact: true })).toBeVisible()
})

test('displays a failed batch without an unhandled rejection', async ({ page }) => {
  await page.getByRole('button', { name: 'Search "error"', exact: true }).click()
  await page.clock.runFor(2850)
  await expect(page.getByRole('alert')).toHaveText('Error: Simulated batch API error')
  await expect(
    page.getByText('Total Searches Made: 1, Results Found: 0, Batches Processed: 0', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(page.getByText('Processing batch search...', { exact: true })).toHaveCount(0)
})
