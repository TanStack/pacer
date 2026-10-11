import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders retry configurations and an idle request', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', { name: 'TanStack Pacer asyncRetry Example' }),
  ).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveValue('default')
  await expect(page.getByRole('textbox')).toHaveValue('123')
  await page.getByRole('combobox').selectOption('timeout')
  await expect(page.locator('pre')).toContainText('"maxExecutionTime": 2000')
  await page.getByRole('combobox').selectOption('jitter')
  await expect(page.locator('pre')).toContainText('"jitter": 0.3')
  await page.getByRole('combobox').selectOption('linear')
  await expect(page.locator('pre')).toContainText('"backoff": "linear"')
})

test('fetches a user successfully and resets the displayed result', async ({
  page,
  exampleUrl,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.9
  })
  await page.goto(exampleUrl)
  await page.getByRole('button', { name: 'Fetch User', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Fetching...', exact: true }),
  ).toBeDisabled()
  await expect(page.getByRole('combobox')).toBeDisabled()
  await page.clock.runFor(800)
  await expect(page.getByText('Name: User 123', { exact: true })).toBeVisible()
  await expect(
    page.getByText('Email: user123@example.com', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/Request succeeded for user 123/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Fetch User', exact: true }),
  ).toBeEnabled()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByText('Name: User 123', { exact: true })).toHaveCount(0)
  await expect(page.getByText(/State reset/)).toBeVisible()
})

test('retries a deterministic failure with linear backoff and then succeeds', async ({
  page,
  exampleUrl,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1
  })
  await page.goto(exampleUrl)
  await page.getByRole('combobox').selectOption('linear')
  await page.getByRole('button', { name: 'Fetch User', exact: true }).click()
  await page.clock.runFor(800)
  await expect(
    page.getByText(
      /Retry attempt 1 after error: Network error fetching user 123/,
    ),
  ).toBeVisible()
  await expect(page.getByText('Name: User 123', { exact: true })).toHaveCount(0)
  await page.evaluate(() => {
    Math.random = () => 0.9
  })
  await page.clock.runFor(1800)
  await expect(page.getByText('Name: User 123', { exact: true })).toBeVisible()
  await expect(page.getByText(/Final result: User 123/)).toBeVisible()
})

test('reports exhausted retries without an unhandled rejection', async ({
  page,
  exampleUrl,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1
  })
  await page.goto(exampleUrl)
  await page.getByRole('combobox').selectOption('linear')
  await page.getByRole('button', { name: 'Fetch User', exact: true }).click()
  // Four 800ms requests and linear delays of 1000, 2000, and 3000ms.
  await page.clock.runFor(9200)
  await expect(
    page.getByText(/All retries exhausted: Network error fetching user 123/),
  ).toBeVisible()
  await expect(page.getByText('Name: User 123', { exact: true })).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Fetch User', exact: true }),
  ).toBeEnabled()
})
