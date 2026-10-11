import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders the initial value and accurate submitted count', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer useQueuedValue Example 1',
    }),
  ).toBeVisible()
  const range = page
    .getByRole('heading', { name: 'TanStack Pacer useQueuedValue Example 2' })
    .locator('..')
  await expect(
    range.getByRole('row', { name: /^Values Submitted:/ }),
  ).toHaveText(/Values Submitted:\s*1$/)
  await expect(
    range.getByRole('slider', { name: /Queued Range/ }),
  ).toBeDisabled()
})

test('holds changed values while stopped and processes them after starting', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  const example = page
    .getByRole('heading', { name: 'TanStack Pacer useQueuedValue Example 1' })
    .locator('..')
  await example
    .getByRole('button', { name: 'Stop Processing', exact: true })
    .click()
  await example.getByRole('searchbox').fill('queued search')
  await expect(
    example.getByText('Queue Items: queued search', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText('Current Value:', { exact: true }),
  ).toBeVisible()
  await example
    .getByRole('button', { name: 'Start Processing', exact: true })
    .click()
  await page.clock.runFor(500)
  await expect(
    example.getByText('Current Value: queued search', { exact: true }),
  ).toBeVisible()
  await expect(
    example.getByText('Queue Size: 0', { exact: true }),
  ).toBeVisible()
})
