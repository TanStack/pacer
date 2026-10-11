import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders async throttle state and flush control', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer createAsyncThrottler Example',
    }),
  ).toBeVisible()
  await expect(
    page.getByText('API calls made: 0', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Flush', exact: true }),
  ).toBeVisible()
})

test('runs a leading search and flushes the latest pending search', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.getByRole('searchbox').fill('first')
  await expect(page.getByText('Executing...', { exact: true })).toBeVisible()
  await page.clock.runFor(500)
  await expect(
    page.getByText('API calls made: 1', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem').first()).toHaveText(
    /^first result \d+$/,
  )
  await page.getByRole('searchbox').fill('middle')
  await page.getByRole('searchbox').fill('latest')
  await expect(page.getByText('Pending...', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Flush', exact: true }).click()
  await page.clock.runFor(500)
  await expect(
    page.getByText('API calls made: 2', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(3)
  await expect(page.getByRole('listitem').first()).toHaveText(
    /^latest result \d+$/,
  )
  await expect(page.getByText('Pending...', { exact: true })).toHaveCount(0)
})
