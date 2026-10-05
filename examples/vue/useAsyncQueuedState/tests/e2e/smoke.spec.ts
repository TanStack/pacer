import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders and updates returned queue items', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer useAsyncQueuer Example',
    }),
  ).toBeVisible()
  await expect(page.getByText('0: 1', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: 'Add Async Task', exact: true })
    .click()
  await expect(page.getByText('Queue Size: 11', { exact: true })).toBeVisible()
  await expect(page.getByText('10: 11', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Get Next Item', exact: true }).click()
  await expect(page.getByText('0: 2', { exact: true })).toBeVisible()
})

test('subscribes active and pending counts while processing concurrently', async ({
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
  await expect(
    page.getByText('Pending Tasks: 0', { exact: true }),
  ).toBeVisible()
})
