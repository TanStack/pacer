import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders async debounce state and flush control', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Octane attaches external-store subscriptions in its post-paint phase.
  await page.clock.runFor(20)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer useAsyncDebouncer Example',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Flush', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('API calls made: 0', { exact: true }),
  ).toBeVisible()
})

test('flushes the latest search and completes before its configured timeout', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Octane attaches external-store subscriptions in its post-paint phase.
  await page.clock.runFor(20)
  await page.getByRole('searchbox').fill('first')
  await page.getByRole('searchbox').fill('latest')
  await expect(page.getByText('Pending...', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Flush', exact: true }).click()
  await expect(page.getByText('Pending...', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Executing...', { exact: true })).toBeVisible()
  await page.clock.runFor(1499)
  await expect(
    page.getByText('API calls made: 0', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(1)
  await expect(page.getByRole('listitem')).toHaveCount(3)
  await expect(page.getByRole('listitem').first()).toHaveText(
    /^latest result \d+$/,
  )
  await expect(
    page.getByText('API calls made: 1', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Executing...', { exact: true })).toHaveCount(0)
})

test('cancels pending work when the example is unmounted', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  // Octane attaches external-store subscriptions in its post-paint phase.
  await page.clock.runFor(20)
  await page.getByRole('searchbox').fill('canceled')
  await expect(page.getByText('Pending...', { exact: true })).toBeVisible()
  await page.keyboard.press('Shift+Enter')
  await expect(page.getByRole('heading')).toHaveCount(0)
  await page.clock.runFor(2500)
  await page.keyboard.press('Shift+Enter')
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await expect(
    page.getByText('API calls made: 0', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(0)
})
