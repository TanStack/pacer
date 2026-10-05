import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders search, counter, and email validation scenarios', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: /^TanStack Pacer useAsyncDebouncedCallback Example/,
    }),
  ).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Increment (debounced API call)' }),
  ).toBeVisible()
})

test('displays a search failure and recovers on the next query', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const input = page.getByRole('searchbox')
  await input.fill('error')
  await page.clock.runFor(1000)
  await expect(
    page.getByText('Error: Simulated API error', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await input.fill('recovered')
  await page.clock.runFor(1000)
  await expect(
    page.getByText('Error: Simulated API error', { exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole('listitem')).toHaveCount(3)
  await expect(page.getByRole('listitem').first()).toHaveText(
    /^recovered result \d+$/,
  )
})

test('updates the counter immediately and records the async API result', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const count = page
    .getByRole('row')
    .filter({ hasText: 'Current Count:' })
    .getByRole('cell')
    .last()
  const calls = page
    .getByRole('row')
    .filter({ hasText: 'API Calls Made:' })
    .getByRole('cell')
    .last()
  await page
    .getByRole('button', { name: 'Increment (debounced API call)' })
    .click()
  await expect(count).toHaveText('1')
  await expect(calls).toHaveText('0')
  await page.clock.runFor(1300)
  await expect(count).toHaveText('2')
  await expect(calls).toHaveText('1')
})

test('validates email after typing and clears an empty value', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const email = page.getByRole('textbox', { name: 'Email Address:' })
  await email.fill('invalid')
  await page.clock.runFor(1150)
  await expect(
    page.getByText('Please enter a valid email address', { exact: true }),
  ).toBeVisible()
  await email.fill('user@example.com')
  await page.clock.runFor(1150)
  await expect(page.getByText('Email is valid!', { exact: true })).toBeVisible()
  await email.fill('')
  await page.clock.runFor(750)
  await expect(page.getByText('Email is valid!', { exact: true })).toHaveCount(
    0,
  )
  await expect(
    page.getByText('Please enter a valid email address', { exact: true }),
  ).toHaveCount(0)
})
