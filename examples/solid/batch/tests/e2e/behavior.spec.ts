import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders an empty batch and processes five items at capacity', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer batcher Example' }),
  ).toBeVisible()
  await expect(page.getByText('Batch Items:', { exact: true })).toBeVisible()

  for (let item = 1; item <= 4; item++) {
    await page.getByRole('button', { name: 'Add Number', exact: true }).click()
  }
  await expect(
    page.getByText('Batch Items: 1, 2, 3, 4', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Processed Batches:', { exact: true }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Add Number', exact: true }).click()
  await expect(
    page.getByText(/^Processed Batches: \[1, 2, 3, 4, 5\],/),
  ).toBeVisible()
  await expect(page.getByText('Batch Items:', { exact: true })).toBeVisible()
})

test('processes a partial batch when its wait expires', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.getByRole('button', { name: 'Add Number', exact: true }).click()
  await page.clock.runFor(2999)
  await expect(page.getByText('Batch Items: 1', { exact: true })).toBeVisible()
  await page.clock.runFor(1)
  await expect(page.getByText(/^Processed Batches: \[1\],/)).toBeVisible()
})
