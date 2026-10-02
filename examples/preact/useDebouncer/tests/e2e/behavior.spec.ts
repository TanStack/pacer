import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
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
  // Preact installs passive effects after the next animation frame.
  await page.clock.runFor(17)
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
