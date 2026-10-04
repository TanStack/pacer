import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test('renders the utility controls', async ({ page, exampleUrl }) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', { name: 'Vue useAsyncQueuer', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Schedule', exact: true }),
  ).toBeVisible()
})
test('processes input and clears displayed history', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.getByLabel('Task', { exact: true }).fill('browser task')
  await page.getByRole('button', { name: 'Schedule', exact: true }).click()
  await page.getByRole('button', { name: 'Start queue', exact: true }).click()
  await expect(page.getByTestId('history')).toContainText('browser task')
  await page.getByRole('button', { name: 'Clear history' }).click()
  await expect(page.getByTestId('history')).toHaveText('[]')
})
