import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders an idle batcher and subscribes the pending item list', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer createAsyncBatcher Example',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Process Current Batch Now' }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Add Regular Item', exact: true })
    .click()
  await expect(
    page.getByText('Current Batch Size: 1', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/^1: item-\d+ \(added at/)).toBeVisible()
  await page.getByRole('button', { name: 'Clear Current Batch' }).click()
  await expect(
    page.getByText('No items in current batch', { exact: true }),
  ).toBeVisible()
})

test('manually processes a partial batch and reports its result', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page
    .getByRole('button', { name: 'Add Regular Item', exact: true })
    .click()
  await page.getByRole('button', { name: 'Process Current Batch Now' }).click()
  await expect(
    page.getByText('Is Executing: Yes', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(1000)
  await expect(
    page.getByText('Successful Batches: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Total Items Processed: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Processed Batches (1)', exact: true }),
  ).toBeVisible()
})
