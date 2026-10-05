import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders initial tasks and clears without executing them', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer createAsyncQueuer Example',
    }),
  ).toBeVisible()
  await expect(page.getByText('Queue Size: 10', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear Queue', exact: true }).click()
  await expect(page.getByText('Queue Size: 0', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Items Processed: 0', { exact: true }),
  ).toBeVisible()
})

test('honors changed concurrency and completes every task', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.getByRole('spinbutton').fill('3')
  await page
    .getByRole('button', { name: 'Start Processing', exact: true })
    .click()
  await page.clock.runFor(200)
  await expect(page.getByText('Active Tasks: 3', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Pending Tasks: 7', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(3000)
  await expect(
    page.getByText('Items Processed: 10', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Active Tasks: 0', { exact: true })).toBeVisible()
  await expect(page.getByText('Queue Idle: Yes', { exact: true })).toBeVisible()
})
