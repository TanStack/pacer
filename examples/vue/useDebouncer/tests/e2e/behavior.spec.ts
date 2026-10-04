import { fileURLToPath } from 'node:url'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import { startExampleServer } from '../../../../../tests/e2e/helpers/startExampleServer'
import { expectMatchingExampleLayout } from '../../../../../tests/e2e/helpers/parity'
import type { Page } from '@playwright/test'

function valueInRow(page: Page, label: string) {
  return page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: label, exact: true }) })
    .getByRole('cell')
    .last()
}

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer useDebouncer Example 1',
      exact: true,
    }),
  ).toBeVisible()
})

test('renders the counter, search, and range demos', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(3)
  await expect(
    page.getByRole('button', { name: 'Increment', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(page.getByRole('slider', { name: /Readonly/ })).toBeDisabled()
  await expect(page.getByRole('slider', { name: /Readonly/ })).toHaveValue('50')
})

test('starts debouncing at the third increment and retains the latest call', async ({
  page,
}) => {
  const increment = page.getByRole('button', { name: 'Increment', exact: true })
  const output = valueInRow(page, 'Debounced Count:')
  await increment.click()
  await increment.click()
  await page.clock.runFor(1000)
  await expect(valueInRow(page, 'Instant Count:')).toHaveText('2')
  await expect(output).toHaveText('0')
  await increment.click()
  await page.clock.runFor(300)
  await increment.click()
  await page.clock.runFor(799)
  await expect(output).toHaveText('0')
  await page.clock.runFor(1)
  await expect(output).toHaveText('4')
})

test('flushes a pending counter update immediately', async ({ page }) => {
  const increment = page.getByRole('button', { name: 'Increment', exact: true })
  for (let count = 0; count < 3; count++) await increment.click()
  await expect(valueInRow(page, 'Debounced Count:')).toHaveText('0')
  await page.getByRole('button', { name: 'Flush', exact: true }).first().click()
  await expect(valueInRow(page, 'Debounced Count:')).toHaveText('3')
})

test('applies a changed delay and cancels the pending range update when disabled', async ({
  page,
}) => {
  const delay = page.getByRole('slider', { name: /^Delay:/ })
  const input = page.getByRole('slider', { name: /^Current Range:/ })
  const output = page.getByRole('slider', {
    name: /Debounced Range \(Readonly\)/,
  })
  await delay.press('Home')
  await delay.press('ArrowRight')
  await expect(delay).toHaveValue('50')
  await input.press('ArrowRight')
  await page.clock.runFor(49)
  await expect(output).toHaveValue('50')
  await page.clock.runFor(1)
  await expect(output).toHaveValue('51')
  await input.press('ArrowRight')
  await page.getByRole('checkbox', { name: 'Enabled', exact: true }).uncheck()
  await page.clock.runFor(500)
  await expect(output).toHaveValue('51')
  await page.getByRole('checkbox', { name: 'Enabled', exact: true }).check()
  await input.press('ArrowRight')
  await page.clock.runFor(50)
  await expect(output).toHaveValue('53')
})

test('accepts three-character search text and suppresses a pending short query', async ({
  page,
}) => {
  const input = page.getByRole('searchbox')
  const output = valueInRow(page, 'Debounced Search:')
  await input.fill('ab')
  await page.clock.runFor(600)
  await expect(output).toHaveText('')
  await input.fill('abc')
  await page.clock.runFor(500)
  await expect(output).toHaveText('abc')
  await input.fill('abcdef')
  await input.fill('ab')
  await page.clock.runFor(600)
  await expect(output).toHaveText('abc')
})

test('hosts the Pacer panel in TanStack Devtools and reconnects after closing', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Open TanStack Devtools', exact: true })
    .click()
  const panel = page.locator('[id^="plugin-container-tanstack-pacer-"]')
  await expect(panel).toHaveCount(1)
  await expect(panel.getByText('TanStack Pacer', { exact: true })).toBeVisible()
  const increment = page.getByRole('button', { name: 'Increment', exact: true })
  for (let count = 0; count < 3; count++) await increment.click()
  await expect(panel.getByText('counter', { exact: true })).toBeVisible()
  await expect(valueInRow(page, 'Instant Count:')).toHaveText('3')
  await page
    .getByRole('button', { name: 'Close TanStack Devtools', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Open TanStack Devtools', exact: true })
    .click()
  await expect(panel).toHaveCount(1)
  await increment.click()
  await expect(valueInRow(page, 'Instant Count:')).toHaveText('4')
  await expect(panel.getByText('counter', { exact: true })).toBeVisible()
})

test('matches the React example layout and styles at desktop and phone widths', async ({
  page,
  context,
}) => {
  const server = await startExampleServer(
    fileURLToPath(new URL('../../../../react/useDebouncer', import.meta.url)),
  )
  const baseline = await context.newPage()
  try {
    await baseline.route('https://unpkg.com/react-scan/**', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    )
    await baseline.goto(server.url)
    await expect(baseline.getByRole('heading', { level: 1 })).toHaveCount(3)
    await expectMatchingExampleLayout(page, baseline)
  } finally {
    await baseline.close()
    await server.close()
  }
})
