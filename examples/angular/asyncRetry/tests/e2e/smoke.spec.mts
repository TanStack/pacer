import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer asyncRetry Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders retry configuration and initial idle state', async ({ page }) => {
  await expect(page.getByRole('combobox', { name: 'Scenario:', exact: true })).toHaveValue(
    'default',
  )
  await expect(page.getByText('Status: idle', { exact: true })).toBeVisible()
  await expect(page.getByText('No activity yet', { exact: true })).toBeVisible()
})

test('retries a failed request and displays the successful result', async ({ page }) => {
  await page.evaluate(() => {
    let requests = 0
    Math.random = () => (requests++ === 0 ? 0 : 1)
  })
  await page.getByRole('textbox', { name: 'User ID:', exact: true }).fill('456')
  await page.getByRole('button', { name: 'Fetch User', exact: true }).click()
  await page.clock.runFor(850)
  await expect(page.getByText('Current Attempt: 2 / 5', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fetching...', exact: true })).toBeDisabled()
  await page.clock.runFor(1900)
  await expect(
    page.getByText('ID: 456, Name: User 456, Email: user456@example.com', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(page.getByText('Status: idle', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.clock.runFor(32)
  await expect(page.getByRole('heading', { name: 'User Data', exact: true })).toHaveCount(0)
})
