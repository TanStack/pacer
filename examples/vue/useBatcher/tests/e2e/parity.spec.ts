import { fileURLToPath } from 'node:url'
import { expectPacerDevtools } from '../../../../../tests/e2e/helpers/devtools'
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
    fileURLToPath(new URL('../../../../react/useBatcher', import.meta.url)),
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
      await page
        .getByRole('button', { name: 'Add Number', exact: true })
        .first()
        .click()
    },
    'useBatcher',
  )
})
