import { expect, test } from './fixtures'

/** Shared interaction checks for the equivalent utility comparison pages. */
export function testComparisonControls() {
  test('shows pending colors and flushes the latest debounce and batch values', async ({
    page,
    exampleUrl,
  }) => {
    await page.goto(exampleUrl)
    await page.clock.runFor(20)
    const input = page.getByRole('slider', { name: /Current Value/ })
    await input.focus()
    await input.press('ArrowRight')
    await expect(input).toHaveValue('51')
    for (const name of ['Debouncer', 'Batcher']) {
      const card = page
        .getByRole('heading', { name, exact: true })
        .locator('..')
      await expect(
        card.getByText('Processing...', { exact: true }),
      ).toBeVisible()
      await expect(card).toHaveCSS(
        'background-color',
        'rgba(254, 249, 195, 0.4)',
      )
      await card.getByRole('button', { name: 'Flush', exact: true }).click()
      await expect(card.getByText('Value: 51', { exact: true })).toBeVisible()
      await expect(card.getByText('Synced', { exact: true })).toBeVisible()
      await expect(card).toHaveCSS(
        'background-color',
        'rgba(209, 250, 229, 0.4)',
      )
    }
  })

  test('shows rejected rate-limit updates as out of sync with an explanation', async ({
    page,
    exampleUrl,
  }) => {
    await page.goto(exampleUrl)
    await page.clock.runFor(20)
    const input = page.getByRole('slider', { name: /Current Value/ })
    await input.focus()
    for (let index = 0; index < 21; index++) await input.press('ArrowRight')
    await expect(input).toHaveValue('71')
    const card = page
      .getByRole('heading', { name: 'Rate Limiter', exact: true })
      .locator('..')
    await expect(card.getByText('Value: 70', { exact: true })).toBeVisible()
    await expect(
      card.getByText('Rejections:', { exact: true }).locator('..'),
    ).toHaveText(/Rejections:\s*1\s*$/)
    const status = card.getByText('Out of sync', { exact: true })
    await expect(status).toBeVisible()
    await expect(
      card.getByTitle(/Rejected calls are discarded entirely/),
    ).toContainText('Out of sync')
    await expect(card).toHaveCSS('background-color', 'rgba(254, 226, 226, 0.4)')
  })
}
