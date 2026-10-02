import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectRateLimitedSignal Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the counter, search, and disabled output range', async ({ page }) => {
  await expect(page.getByRole('region')).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Rate Limited Range', exact: true })).toBeDisabled()
})

test('rejects calls above the window limit and accepts a new window', async ({ page }) => {
  const counter = page.getByRole('region', { name: 'Counter' })
  const increment = counter.getByRole('button', {
    name: 'Increment',
    exact: true,
  })
  for (let i = 0; i < 6; i++) await increment.click()
  await page.clock.runFor(32)
  await expect(counter.getByText('Instant Count: 6', { exact: true })).toBeVisible()
  await expect(counter.getByText('Rate Limited Count: 5', { exact: true })).toBeVisible()
  await page.clock.runFor(5050)
  await increment.click()
  await page.clock.runFor(32)
  await expect(counter.getByText('Rate Limited Count: 7', { exact: true })).toBeVisible()
})
