import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectDebouncer Example',
      exact: true,
    }),
  ).toBeVisible()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the counter, search, and range controls', async ({ page }) => {
  await expect(page.getByRole('region')).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(
    page.getByRole('slider', { name: 'Debounced Range', exact: true }),
  ).toBeDisabled()
})

test('waits until the third increment and flushes its pending value', async ({
  page,
}) => {
  const counter = page.getByRole('region', { name: 'Counter' })
  const increment = counter.getByRole('button', {
    name: 'Increment',
    exact: true,
  })
  await increment.click()
  await increment.click()
  await page.clock.runFor(1000)
  await expect(
    counter.getByText('Instant Count: 2', { exact: true }),
  ).toBeVisible()
  await expect(
    counter.getByText('Debounced Count: 0', { exact: true }),
  ).toBeVisible()
  await increment.click()
  await page.clock.runFor(32)
  await expect(
    counter.getByText('Pending: true', { exact: true }),
  ).toBeVisible()
  await counter.getByRole('button', { name: 'Flush', exact: true }).click()
  await page.clock.runFor(32)
  await expect(
    counter.getByText('Debounced Count: 3', { exact: true }),
  ).toBeVisible()
  await expect(
    counter.getByText('Pending: false', { exact: true }),
  ).toBeVisible()
})

test('updates the range delay and cancels pending work when disabled', async ({
  page,
}) => {
  const range = page.getByRole('region', { name: 'Range' })
  const input = range.getByRole('slider', {
    name: 'Current Range',
    exact: true,
  })
  const output = range.getByRole('slider', {
    name: 'Debounced Range',
    exact: true,
  })
  await range
    .getByRole('slider', { name: 'Debounce delay', exact: true })
    .press('End')
  await page.clock.runFor(32)
  await input.press('ArrowRight')
  await page.clock.runFor(1000)
  await expect(output).toHaveValue('50')
  await page.clock.runFor(550)
  await expect(output).toHaveValue('51')
  await input.press('ArrowRight')
  await page.clock.runFor(32)
  await range.getByRole('checkbox', { name: 'Enabled', exact: true }).uncheck()
  await page.clock.runFor(1600)
  await expect(output).toHaveValue('51')
  await expect(range.getByText('Pending: false', { exact: true })).toBeVisible()
  await range.getByRole('checkbox', { name: 'Enabled', exact: true }).check()
  await page.clock.runFor(32)
  await input.press('ArrowRight')
  await page.clock.runFor(1550)
  await expect(output).toHaveValue('53')
})
