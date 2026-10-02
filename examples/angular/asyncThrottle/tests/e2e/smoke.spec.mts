import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer asyncThrottle Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders the search example with no results', async ({ page }) => {
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Search Results', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(0)
})

test('returns the simulated search results after the asynchronous call', async ({
  page,
}) => {
  await page.getByRole('searchbox').fill('pacer')
  await page.clock.runFor(32)
  await page.clock.runFor(32)
  await expect(page.getByText('Loading...', { exact: true })).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await page.clock.runFor(832)
  await expect(page.getByRole('listitem')).toHaveText([
    'Result 1 for pacer',
    'Result 2 for pacer',
    'Result 3 for pacer',
  ])
  await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0)
})
