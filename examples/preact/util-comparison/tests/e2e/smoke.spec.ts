import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders all five utilities with disabled output sliders', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Preact installs passive effects after the next animation frame.
  await page.clock.runFor(17)
  await expect(
    page.getByRole('button', { name: 'Open TanStack Devtools' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer Utilities Comparison' }),
  ).toBeVisible()
  for (const name of [
    'Debouncer',
    'Throttler',
    'Rate Limiter',
    'Queuer',
    'Batcher',
  ]) {
    const card = page.getByRole('heading', { name, exact: true }).locator('..')
    await expect(card.getByRole('slider')).toBeDisabled()
    await expect(card.getByText('Value: 50', { exact: true })).toBeVisible()
  }
})

test('propagates the main slider through every timing utility', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Preact installs passive effects after the next animation frame.
  await page.clock.runFor(17)
  await expect(
    page.getByRole('button', { name: 'Open TanStack Devtools' }),
  ).toBeVisible()
  const input = page.getByRole('slider', { name: /Current Value/ })
  await input.focus()
  await input.press('ArrowRight')
  await expect(input).toHaveValue('51')
  const debouncer = page
    .getByRole('heading', { name: 'Debouncer', exact: true })
    .locator('..')
  await expect(debouncer.getByText('Value: 50', { exact: true })).toBeVisible()
  await page.clock.runFor(600)
  for (const name of [
    'Debouncer',
    'Throttler',
    'Rate Limiter',
    'Queuer',
    'Batcher',
  ]) {
    const card = page.getByRole('heading', { name, exact: true }).locator('..')
    await expect(card.getByText('Value: 51', { exact: true })).toBeVisible()
    await expect(card.getByText('Synced', { exact: true })).toBeVisible()
  }
})
