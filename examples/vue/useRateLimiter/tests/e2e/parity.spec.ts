import { fileURLToPath } from 'node:url'
import { expectPacerDevtools } from '../../../../../tests/e2e/helpers/devtools'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import { startExampleServer } from '../../../../../tests/e2e/helpers/startExampleServer'
import { expectMatchingExampleLayout } from '../../../../../tests/e2e/helpers/parity'

test('matches React layout and styles at desktop and phone widths', async ({
  page,
  exampleUrl,
  context,
}) => {
  const server = await startExampleServer(
    fileURLToPath(new URL('../../../../react/useRateLimiter', import.meta.url)),
  )
  const baseline = await context.newPage()
  try {
    await baseline.route('https://unpkg.com/react-scan/**', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    )
    await page.goto(exampleUrl)
    await baseline.goto(server.url)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(
      baseline.getByRole('heading', { level: 1 }).first(),
    ).toBeVisible()
    await expectMatchingExampleLayout(page, baseline, '#app > div:first-child')
  } finally {
    await baseline.close()
    await server.close()
  }
})

test('hosts Pacer in TanStack Devtools with live utility state', async ({
  page,
  exampleUrl,
}) => {
  await page.goto(exampleUrl)

  await expectPacerDevtools(
    page,
    async () => {
      for (let i = 0; i < 3; i++) {
        await page
          .getByRole('button', { name: 'Increment', exact: true })
          .first()
          .click()
      }
    },
    'counter',
  )
})
