import { fileURLToPath } from 'node:url'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import { startExampleServer } from '../../../../../tests/e2e/helpers/startExampleServer'
import { expectMatchingExampleLayout } from '../../../../../tests/e2e/helpers/parity'

test('layout comparison tolerates subpixel positioning across frameworks', async ({
  page,
  context,
}) => {
  const baseline = await context.newPage()
  try {
    await baseline.setContent(
      '<div id="root"><div><button>Validate</button></div></div>',
    )
    await page.setContent(
      '<div id="app"><div><button style="position: relative; left: 0.75px">Validate</button></div></div>',
    )
    await expectMatchingExampleLayout(page, baseline)
  } finally {
    await baseline.close()
  }
})

for (const [difference, button] of [
  [
    'larger offsets',
    '<button style="position: relative; left: 1.25px">Validate</button>',
  ],
  ['text', '<button>Different</button>'],
  ['styles', '<button style="color: red">Validate</button>'],
  ['missing elements', ''],
]) {
  test(`layout comparison still rejects ${difference}`, async ({
    page,
    context,
  }) => {
    const baseline = await context.newPage()
    try {
      await baseline.setContent(
        '<div id="root"><div><button>Validate</button></div></div>',
      )
      await page.setContent(`<div id="app"><div>${button}</div></div>`)
      await expect(
        expectMatchingExampleLayout(page, baseline),
      ).rejects.toThrow()
    } finally {
      await baseline.close()
    }
  })
}

test('matches React layout and styles at desktop and phone widths', async ({
  page,
  exampleUrl,
  context,
}) => {
  const server = await startExampleServer(
    fileURLToPath(
      new URL('../../../../react/useAsyncBatchedCallback', import.meta.url),
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
      [['useAsyncBatcher', 'useAsyncBatchedCallback']],
    )
  } finally {
    await baseline.close()
    await server.close()
  }
})
