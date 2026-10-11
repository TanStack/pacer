import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders log, analytics, and request batching scenarios', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Preact installs passive effects after the next animation frame.
  await page.clock.runFor(17)
  for (const number of [1, 2, 3]) {
    await expect(
      page.getByRole('heading', {
        name: `TanStack Pacer useBatchedCallback Example ${number}`,
      }),
    ).toBeVisible()
  }
  await expect(
    page.getByText('No logs processed yet...', { exact: true }),
  ).toBeVisible()
})

test('processes logs at capacity and flushes a later partial batch on time', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Preact installs passive effects after the next animation frame.
  await page.clock.runFor(17)
  const example = page
    .getByRole('heading', {
      name: 'TanStack Pacer useBatchedCallback Example 1',
    })
    .locator('..')
  await example
    .getByRole('button', { name: 'Add Log Entry', exact: true })
    .click()
  await expect(
    example.getByRole('row', { name: /^Logs Processed:/ }),
  ).toHaveText(/Logs Processed:\s*0$/)
  await example
    .getByRole('button', { name: 'Add Warning', exact: true })
    .click()
  await example.getByRole('button', { name: 'Add Error', exact: true }).click()
  await expect(
    example.getByRole('row', { name: /^Logs Processed:/ }),
  ).toHaveText(/Logs Processed:\s*3$/)
  await example
    .getByRole('button', { name: 'Add Log Entry', exact: true })
    .click()
  await page.clock.runFor(2000)
  await expect(
    example.getByRole('row', { name: /^Logs Processed:/ }),
  ).toHaveText(/Logs Processed:\s*4$/)
})
