import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders the async debounce search', async ({ page, exampleUrl }) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer asyncDebounce Example' }),
  ).toBeVisible()
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await expect(page.getByRole('listitem')).toHaveCount(0)
})

test('coalesces input and displays results after the simulated request', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const input = page.getByRole('searchbox')
  const executed = page
    .getByRole('row')
    .filter({ hasText: 'Debounced Search:' })
    .getByRole('cell')
    .last()
  await input.fill('first')
  await input.fill('latest')
  await expect(executed).toHaveText('')
  await page.clock.runFor(499)
  await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0)
  await page.clock.runFor(1)
  await expect(executed).toHaveText('latest')
  await expect(page.getByText('Loading...', { exact: true })).toBeVisible()
  await page.clock.runFor(800)
  await expect(page.getByRole('listitem')).toHaveText([
    'Result 1 for latest',
    'Result 2 for latest',
    'Result 3 for latest',
  ])
  await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0)
})
