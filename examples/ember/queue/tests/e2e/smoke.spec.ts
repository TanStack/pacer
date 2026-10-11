import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders all queue scenarios and disables output sliders', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  for (const number of [1, 2, 3]) {
    await expect(
      page.getByRole('heading', {
        name: `TanStack Pacer queue Example ${number}`,
      }),
    ).toBeVisible()
  }
  await expect(
    page.getByRole('slider', { name: /Queued Range/ }),
  ).toBeDisabled()
})

test('updates processed counts and drains queued items in order', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  const example = page
    .getByRole('heading', { name: 'TanStack Pacer queue Example 1' })
    .locator('..')
  await example.getByRole('button', { name: 'Add Number', exact: true }).click()
  await expect(
    example.getByRole('row', { name: /^Items Processed:/ }),
  ).toHaveText(/Items\s+Processed:\s*1\s*$/)
  await example.getByRole('button', { name: 'Add Number', exact: true }).click()
  await expect(example.getByRole('row', { name: /^Queue Size:/ })).toHaveText(
    /Queue\s+Size:\s*1\s*$/,
  )
  await page.clock.runFor(1000)
  await expect(
    example.getByRole('row', { name: /^Items Processed:/ }),
  ).toHaveText(/Items\s+Processed:\s*2\s*$/)
  await expect(example.getByRole('row', { name: /^Queue Size:/ })).toHaveText(
    /Queue\s+Size:\s*0\s*$/,
  )
})
