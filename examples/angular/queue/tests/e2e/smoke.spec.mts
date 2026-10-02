import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer queue Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders empty number, text, and range queues', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(
    page.getByRole('slider', { name: 'Queued Range', exact: true }),
  ).toBeDisabled()
})

test('processes every submitted search value in FIFO order', async ({
  page,
}) => {
  const queue = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: 'Text changes', exact: true }),
    })
  await page.getByRole('searchbox').fill('first')
  await page.getByRole('searchbox').fill('second')
  await page.clock.runFor(32)
  await expect(
    queue.getByText('Current Value: first', { exact: true }),
  ).toBeVisible()
  await expect(
    queue.getByText('Items Processed: 1', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(500)
  await expect(
    queue.getByText('Current Value: second', { exact: true }),
  ).toBeVisible()
  await expect(
    queue.getByText('Items Processed: 2', { exact: true }),
  ).toBeVisible()
  await expect(queue.getByText('Queue Size: 0', { exact: true })).toBeVisible()
})
