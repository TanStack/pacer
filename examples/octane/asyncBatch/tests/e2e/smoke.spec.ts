import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders pending items and processes an urgent batch', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer asyncBatch Example' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Add Regular Item', exact: true })
    .click()
  await expect(
    page.getByText('Pending Items: 1', { exact: true }),
  ).toBeVisible()
  // The example uses Date.now() as the item ID.
  await page.clock.runFor(1)
  await page
    .getByRole('button', {
      name: 'Add Urgent Item (Processes Immediately)',
      exact: true,
    })
    .click()
  await expect(
    page.getByText('Is Processing: Yes', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(1000)
  await expect(
    page.getByText('Successful Batches: 1', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/^Processed 2 items:/)).toBeVisible()
  await expect(
    page.getByText('Pending Items: 0', { exact: true }),
  ).toBeVisible()
})

test('uses the current failure toggle without losing pending items', async ({
  page,
  exampleUrl,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  await page
    .getByRole('button', { name: 'Add Regular Item', exact: true })
    .click()
  await page.getByRole('checkbox').check()
  await page.clock.runFor(1)
  await page
    .getByRole('button', {
      name: 'Add Urgent Item (Processes Immediately)',
      exact: true,
    })
    .click()
  await page.clock.runFor(1000)
  await expect(
    page.getByText('Failed Batches: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText(/Error:.*Processing failed for batch with 2 items/),
  ).toBeVisible()

  await page.getByRole('checkbox').uncheck()
  await page
    .getByRole('button', {
      name: 'Add Urgent Item (Processes Immediately)',
      exact: true,
    })
    .click()
  await page.clock.runFor(1000)
  await expect(
    page.getByText('Successful Batches: 1', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Failed Batches: 1', { exact: true }),
  ).toBeVisible()
})
