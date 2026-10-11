import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders the selected initial queue items', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const example = page
    .getByRole('heading', {
      name: 'TanStack Pacer createQueuedState Example 1',
    })
    .locator('..')
  await expect(
    example.getByText('Queue Items: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    example.getByText('Queue Size: 10', { exact: true }),
  ).toBeVisible()
})

test('updates returned items after adding and processing an item', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const example = page
    .getByRole('heading', {
      name: 'TanStack Pacer createQueuedState Example 1',
    })
    .locator('..')
  await example.getByRole('button', { name: 'Add Number', exact: true }).click()
  await expect(
    example.getByText('Queue Size: 11', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText(/^\s*Queue Items:\s*1, 2,.*10, 11\s*$/),
  ).toBeVisible()
  await example
    .getByRole('button', { name: 'Process Next', exact: true })
    .click()
  await expect(
    example.getByText('Items Processed: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText(/^\s*Queue Items:\s*2, 3,.*10, 11\s*$/),
  ).toBeVisible()
})
