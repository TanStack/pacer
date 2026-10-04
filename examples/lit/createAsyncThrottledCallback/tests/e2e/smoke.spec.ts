import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders search, counter, and scroll saving scenarios', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: /^TanStack Pacer createAsyncThrottledCallback Example/,
    }),
  ).toHaveCount(3)
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Increment (throttled API call)' }),
  ).toBeVisible()
})

test('displays a search failure and recovers on the next query', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const input = page.getByRole('searchbox')
  await input.fill('error')
  await page.clock.runFor(1500)
  await expect(
    page.getByText('Error: Simulated API error', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await input.fill('recovered')
  await page.clock.runFor(1500)
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
    .getByRole('button', { name: 'Increment (throttled API call)' })
    .click()
  await expect(count).toHaveText('1')
  await expect(calls).toHaveText('0')
  await page.clock.runFor(300)
  await expect(count).toHaveText('2')
  await expect(calls).toHaveText('1')
})

test('saves a scroll position and reports the completed save', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const scrollArea = page.getByRole('region', { name: 'Scroll position demo' })
  // Scroll the actual overflow container and dispatch the browser scroll event.
  await scrollArea.evaluate((element) => {
    element.scrollTop = 150
    element.dispatchEvent(new Event('scroll'))
  })
  // The saving status can shift Chromium's scroll anchor after the input.
  await expect
    .poll(() =>
      scrollArea.evaluate((element) => {
        const position = Math.round(element.scrollTop)
        return (
          position > 0 &&
          element.textContent.includes(`Current scroll position: ${position}px`)
        )
      }),
    )
    .toBe(true)
  await page.clock.runFor(300)
  await expect(scrollArea).toContainText('Saves triggered: 1')
  await expect(scrollArea).toContainText('Last saved at:')
})
