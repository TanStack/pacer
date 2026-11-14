import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer debounce Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the counter, search, and disabled output range', async ({
  page,
}) => {
  await expect(page.getByRole('region')).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(
    page.getByRole('slider', { name: 'Debounced Range', exact: true }),
  ).toBeDisabled()
})

test('coalesces counter increments into the latest value', async ({ page }) => {
  const counter = page.getByRole('region', { name: 'Counter' })
  const increment = counter.getByRole('button', {
    name: 'Increment',
    exact: true,
  })
  await increment.click()
  await page.clock.runFor(200)
  await increment.click()
  await page.clock.runFor(32)
  await expect(
    counter.getByText('Instant Count: 2', { exact: true }),
  ).toBeVisible()
  await expect(
    counter.getByText('Debounced Count: 0', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(550)
  await expect(
    counter.getByText('Debounced Count: 2', { exact: true }),
  ).toBeVisible()
})
