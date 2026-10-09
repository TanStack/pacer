import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectQueuedComputed Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders queued search and range values', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Queued search value', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Queued Range', exact: true })).toBeDisabled()
})

test('retains pending search values while stopped and executes them in order', async ({ page }) => {
  const queue = page.locator('section').filter({
    has: page.getByRole('heading', {
      name: 'Queued search value',
      exact: true,
    }),
  })
  await queue.getByRole('button', { name: 'Stop Processing', exact: true }).click()
  await page.clock.runFor(32)
  await expect(queue.getByText('Queue Size: 0', { exact: true })).toBeVisible()
  await queue.getByRole('searchbox').fill('first')
  await page.clock.runFor(32)
  await queue.getByRole('searchbox').fill('second')
  await page.clock.runFor(32)
  await queue.getByRole('button', { name: 'Start Processing', exact: true }).click()
  await page.clock.runFor(32)
  await expect(queue.getByText('Current Value: first', { exact: true })).toBeVisible()
  await expect(queue.getByText('Queue Items: second', { exact: true })).toBeVisible()
  await page.clock.runFor(550)
  await expect(queue.getByText('Current Value: second', { exact: true })).toBeVisible()
  await expect(queue.getByText('Queue Size: 0', { exact: true })).toBeVisible()
  await expect(queue.getByText('Queue Items:', { exact: true })).toBeVisible()
})
