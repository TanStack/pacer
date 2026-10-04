import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectAsyncThrottler Example 1',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders all three asynchronous callback demos', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Async counter', exact: true })).toBeVisible()
})

test('shows successful results and handles a simulated search error', async ({ page }) => {
  const input = page.getByRole('searchbox')
  await input.fill('pacer')
  await page.clock.runFor(550)
  await expect(page.getByRole('listitem')).toHaveText([
    'pacer result 1',
    'pacer result 2',
    'pacer result 3',
  ])
  await page.clock.runFor(1000)
  await input.fill('error')
  await page.clock.runFor(550)
  await expect(page.getByRole('alert')).toHaveText('Error: Simulated API error')
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0)
})
