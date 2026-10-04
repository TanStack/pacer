import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'

test('renders the utility controls', async ({ page, exampleUrl }) => {
  await page.goto(exampleUrl)
  await expect(
    page.getByRole('heading', { name: 'Vue useDebouncer', exact: true }),
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
  await expect(page.getByTestId('history')).toContainText('browser task')
  await page.getByRole('button', { name: 'Clear history' }).click()
  await expect(page.getByTestId('history')).toHaveText('[]')
})

test('uses reactive wait options and cancels pending calls', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)
  await page.clock.install()
  await page.getByLabel('Wait (ms)', { exact: true }).fill('1000')
  await page.getByLabel('Task', { exact: true }).fill('latest')
  await page.getByRole('button', { name: 'Schedule', exact: true }).click()
  await page.clock.runFor(500)
  await expect(page.getByTestId('history')).toHaveText('[]')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.clock.runFor(1000)
  await expect(page.getByTestId('history')).toHaveText('[]')
  await page
    .getByRole('button', { name: 'Schedule three', exact: true })
    .click()
  await page.clock.runFor(1000)
  await expect(page.getByTestId('history')).toContainText('latest 3')
  await expect(page.getByTestId('history')).not.toContainText('latest 1')
})
