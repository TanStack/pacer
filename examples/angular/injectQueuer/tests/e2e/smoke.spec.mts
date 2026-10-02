import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectQueuer Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the ten seeded items and stopped queue', async ({ page }) => {
  const queue = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Number queue', exact: true }),
  })
  await expect(queue.getByText('Queue Size: 10', { exact: true })).toBeVisible()
  await expect(
    queue.getByText('Queue Items: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(queue.getByRole('button', { name: 'Start Processing', exact: true })).toBeEnabled()
})

test('adds an item, executes the first item, then clears the remaining queue', async ({ page }) => {
  const queue = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Number queue', exact: true }),
  })
  await queue.getByRole('button', { name: 'Add Number', exact: true }).click()
  await page.clock.runFor(32)
  await expect(
    queue.getByText('Queue Items: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11', {
      exact: true,
    }),
  ).toBeVisible()
  await queue.getByRole('button', { name: 'Process Next', exact: true }).click()
  await page.clock.runFor(32)
  await expect(queue.getByText('Queue Peek: 2', { exact: true })).toBeVisible()
  await expect(queue.getByText('Items Processed: 1', { exact: true })).toBeVisible()
  await queue.getByRole('button', { name: 'Clear Queue', exact: true }).click()
  await page.clock.runFor(32)
  await expect(queue.getByText('Queue Size: 0', { exact: true })).toBeVisible()
  await expect(queue.getByText('Items Processed: 1', { exact: true })).toBeVisible()
})
