import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectAsyncQueuedSignal Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the stopped queue with ten seeded tasks', async ({ page }) => {
  await expect(page.getByRole('listitem')).toHaveText([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ])
  await expect(
    page.getByRole('spinbutton', { name: 'Concurrency:', exact: true }),
  ).toHaveValue('2')
  await expect(
    page.getByRole('button', { name: 'Stop Processing', exact: true }),
  ).toBeDisabled()
})

test('updates concurrency before starting and completes only the active tasks after stopping', async ({
  page,
}) => {
  await page
    .getByRole('spinbutton', { name: 'Concurrency:', exact: true })
    .fill('3')
  await page.clock.runFor(32)
  await page
    .getByRole('button', { name: 'Start Processing', exact: true })
    .click()
  await page.clock.runFor(350)
  await expect(
    page.getByText('Active Tasks: 3, Pending Tasks: 7', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Stop Processing', exact: true })
    .click()
  await page.clock.runFor(850)
  await expect(
    page.getByText('Active Tasks: 0, Pending Tasks: 7', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Items Processed: 3, Items Rejected: 0', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Completed values: 1, 2, 3', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveText([
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
  ])
})
