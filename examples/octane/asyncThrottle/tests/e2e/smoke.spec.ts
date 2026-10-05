import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders the async throttle search', async ({ page, exampleUrl }) => {
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer asyncThrottle Example' }),
  ).toBeVisible()
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await expect(page.getByRole('listitem')).toHaveCount(0)
})

test('executes the first search and coalesces later input during the wait', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.clock.runFor(20)
  const input = page.getByRole('searchbox')
  const executed = page
    .getByRole('row')
    .filter({ hasText: 'Throttled Search:' })
    .getByRole('cell')
    .last()
  await input.fill('first')
  await expect(executed).toHaveText('first')
  await page.clock.runFor(800)
  await expect(page.getByRole('listitem')).toHaveText([
    'Result 1 for first',
    'Result 2 for first',
    'Result 3 for first',
  ])
  await input.fill('middle')
  await input.fill('latest')
  await expect(executed).toHaveText('first')
  // Async throttling measures its wait from the previous completion.
  await page.clock.runFor(1000)
  await expect(executed).toHaveText('latest')
  await page.clock.runFor(800)
  await expect(page.getByRole('listitem')).toHaveText([
    'Result 1 for latest',
    'Result 2 for latest',
    'Result 3 for latest',
  ])
  await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0)
})
