import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders both rate limit window controls', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer asyncRateLimit Example',
    }),
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Fixed Window' })).toBeChecked()
  await expect(
    page.getByRole('radio', { name: 'Sliding Window' }),
  ).not.toBeChecked()
  await expect(page.getByRole('searchbox')).toBeVisible()
})

for (const windowType of ['Fixed Window', 'Sliding Window']) {
  test(`limits requests and resumes after the ${windowType.toLowerCase()} expires`, async ({
    page,
    exampleUrl,
  }) => {
    await page.goto(exampleUrl)
    await page.getByRole('radio', { name: windowType }).check()
    const input = page.getByRole('searchbox')
    const executed = page
      .getByRole('row')
      .filter({ hasText: 'Rate Limited Search:' })
      .getByRole('cell')
      .last()
    for (let index = 1; index <= 5; index++) {
      await input.fill(`query-${index}`)
      await page.clock.runFor(800)
      await expect(page.getByRole('listitem').first()).toHaveText(
        `Result 1 for query-${index}`,
      )
    }
    await input.fill('rejected')
    await expect(input).toHaveValue('rejected')
    await expect(executed).toHaveText('query-5')
    await expect(page.getByRole('listitem').first()).toHaveText(
      'Result 1 for query-5',
    )
    await page.clock.runFor(1001)
    await input.fill('accepted-again')
    await expect(executed).toHaveText('accepted-again')
    await page.clock.runFor(800)
    await expect(page.getByRole('listitem').first()).toHaveText(
      'Result 1 for accepted-again',
    )
  })
}
