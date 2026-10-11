import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

test('renders request counts and window controls', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer createAsyncRateLimiter Example',
    }),
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Fixed Window' })).toBeChecked()
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'API calls made:' })
      .getByRole('cell')
      .last(),
  ).toHaveText('0')
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'Rejected calls:' })
      .getByRole('cell')
      .last(),
  ).toHaveText('0')
})

for (const windowType of ['Fixed Window', 'Sliding Window']) {
  test(`counts accepted and rejected requests with a ${windowType.toLowerCase()}`, async ({
    page,
    exampleUrl,
  }) => {
    await page.goto(exampleUrl)
    await page.getByRole('radio', { name: windowType }).check()
    const input = page.getByRole('searchbox')
    const successes = page
      .getByRole('row')
      .filter({ hasText: 'API calls made:' })
      .getByRole('cell')
      .last()
    const rejections = page
      .getByRole('row')
      .filter({ hasText: 'Rejected calls:' })
      .getByRole('cell')
      .last()
    for (let index = 1; index <= 3; index++) {
      await input.fill(`query-${index}`)
      await page.clock.runFor(300)
      await expect(successes).toHaveText(String(index))
    }
    await input.fill('rejected')
    await expect(rejections).toHaveText('1')
    await expect(successes).toHaveText('3')
    await expect(page.getByRole('listitem').first()).toHaveText(
      /^query-3 result \d+$/,
    )
    await page.clock.runFor(3001)
    await input.fill('accepted-again')
    await page.clock.runFor(300)
    await expect(successes).toHaveText('4')
    await expect(page.getByRole('listitem').first()).toHaveText(
      /^accepted-again result \d+$/,
    )
  })
}
