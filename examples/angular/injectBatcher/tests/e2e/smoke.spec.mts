import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page, exampleUrl }) => {
  await page.clock.install()
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer injectBatcher Example',
      exact: true,
    }),
  ).toBeVisible()
  // Let Angular bootstrap before pausing timers; runFor also advances render frames.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100))
})

test('renders an empty batch', async ({ page }) => {
  await expect(page.getByText('Batch Size: 0 / 5', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Number', exact: true })).toBeVisible()
})

test('processes five items together when the batch fills', async ({ page }) => {
  const add = page.getByRole('button', { name: 'Add Number', exact: true })
  for (let i = 0; i < 4; i++) await add.click()
  await page.clock.runFor(32)
  await expect(page.getByText('Batch Size: 4 / 5', { exact: true })).toBeVisible()
  await expect(page.getByText('[1, 2, 3, 4, 5]', { exact: true })).toHaveCount(0)
  await add.click()
  await page.clock.runFor(32)
  await expect(page.getByText('[1, 2, 3, 4, 5]', { exact: true })).toBeVisible()
  await expect(page.getByText('Batch Size: 0 / 5', { exact: true })).toBeVisible()
})

test('processes a partial batch when its wait elapses', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Number', exact: true }).click()
  await page.clock.runFor(3050)
  await expect(page.getByText('[1]', { exact: true })).toBeVisible()
  await expect(page.getByText('Batch Size: 0 / 5', { exact: true })).toBeVisible()
})
