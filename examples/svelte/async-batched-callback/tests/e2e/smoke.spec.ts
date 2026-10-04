import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders all three async batching scenarios', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  for (const number of [1, 2, 3]) {
    await expect(
      page.getByRole('heading', {
        name: `TanStack Pacer createAsyncBatcher Example ${number}`,
      }),
    ).toBeVisible()
  }
})

test('displays a batch failure and recovers without an unhandled rejection', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const example = page
    .getByRole('heading', {
      name: 'TanStack Pacer createAsyncBatcher Example 1',
    })
    .locator('..')
  for (const name of [
    'Search "error" (will fail)',
    'Search "javascript"',
    'Search "react"',
  ]) {
    await example.getByRole('button', { name, exact: true }).click()
  }
  await page.clock.runFor(800)
  await expect(
    example.getByText('Error: Simulated batch API error', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByRole('row', { name: /^Batches Processed:/ }),
  ).toHaveText(/Batches Processed:\s*0$/)

  for (const name of [
    'Search "javascript"',
    'Search "react"',
    'Search "typescript"',
  ]) {
    await example.getByRole('button', { name, exact: true }).click()
  }
  await page.clock.runFor(800)
  await expect(
    example.getByText('Error: Simulated batch API error', { exact: true }),
  ).toHaveCount(0)
  await expect(
    example.getByRole('row', { name: /^Results Found:/ }),
  ).toHaveText(/Results Found:\s*6$/)
  await expect(
    example.getByRole('row', { name: /^Batches Processed:/ }),
  ).toHaveText(/Batches Processed:\s*1$/)
})
