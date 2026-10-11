import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders the configured maximum batch size', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer useBatcher Example 1' }),
  ).toBeVisible()
  await expect(
    page.getByText('Batch Max Size: 5', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Flush Current Batch' }),
  ).toBeDisabled()
})

test('flushes a partial batch and clears its pending items', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.getByRole('button', { name: 'Add Number', exact: true }).click()
  await page.getByRole('button', { name: 'Add Number', exact: true }).click()
  await expect(
    page.getByText('Batch Items: 1, 2', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Flush Current Batch' }).click()
  await expect(
    page.getByText('Batches Processed: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Items Processed: 2', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Batch Size: 0', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Flush Current Batch' }),
  ).toBeDisabled()
})
