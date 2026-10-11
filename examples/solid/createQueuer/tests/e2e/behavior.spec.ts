import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders a stopped queue with its seeded items', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const example = page
    .getByRole('heading', { name: 'TanStack Pacer createQueuer Example 1' })
    .locator('..')
  await expect(
    example.getByText('Queue Size: 10', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText('Queuer Status: stopped', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('slider', { name: /Queued Range/ }),
  ).toBeDisabled()
})

test('processes one item, then clears the remaining queue', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const example = page
    .getByRole('heading', { name: 'TanStack Pacer createQueuer Example 1' })
    .locator('..')
  await example
    .getByRole('button', { name: 'Process Next', exact: true })
    .click()
  await expect(
    example.getByText('Items Processed: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText('Queue Size: 9', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText('Queue Peek: 2', { exact: true }),
  ).toBeVisible()
  await example
    .getByRole('button', { name: 'Clear Queue', exact: true })
    .click()
  await expect(
    example.getByText('Queue Size: 0', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByRole('button', { name: 'Process Next', exact: true }),
  ).toBeDisabled()
})
