import { fileURLToPath } from 'node:url'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import { startExampleServer } from '../../../../../tests/e2e/helpers/startExampleServer'
import { expectMatchingExampleLayout } from '../../../../../tests/e2e/helpers/parity'

test('matches React layout and styles at desktop and phone widths', async ({
  page,
  exampleUrl,
  context,
}) => {
  const server = await startExampleServer(
    fileURLToPath(
      new URL('../../../../react/useRateLimitedCallback', import.meta.url),
    ),
  )
  const baseline = await context.newPage()
  try {
    await baseline.route('https://unpkg.com/react-scan/**', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    )
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
    await baseline.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
    await baseline.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
    await page.goto(exampleUrl)
    await baseline.goto(server.url)
    await page.clock.runFor(20)
    await baseline.clock.runFor(20)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(
      baseline.getByRole('heading', { level: 1 }).first(),
    ).toBeVisible()
    await expectMatchingExampleLayout(
      page,
      baseline,
      '#app > div:first-child',
      [['createRateLimiter', 'useRateLimitedCallback']],
    )
  } finally {
    await baseline.close()
    await server.close()
  }
})
