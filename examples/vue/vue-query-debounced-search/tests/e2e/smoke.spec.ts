import { expectPacerDevtools } from '../../../../../tests/e2e/helpers/devtools'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import type { Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

async function openExample(page: Page, exampleUrl: string) {
  await page.goto(exampleUrl)
  await expect(page.getByLabel('Search posts')).toBeVisible()
}

const requests = (page: Page, sent: number, cancelled: number) =>
  expect(
    page.getByText(`Requests sent: ${sent} | Cancelled: ${cancelled}`, {
      exact: true,
    }),
  ).toBeVisible()

test('renders an empty search without sending requests', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer/Query Debounced Search Example',
    }),
  ).toBeVisible()
  await expect(page.getByText('Type to search', { exact: true })).toBeVisible()
  await requests(page, 0, 0)
})

test('searches once typing pauses, cancels outdated searches, and caches each term', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  const input = page.getByLabel('Search posts')
  const results = page.getByRole('listitem')

  await input.pressSequentially('data')
  await expect(page.getByText('Typing...', { exact: true })).toBeVisible()
  await page.clock.runFor(299)
  await requests(page, 0, 0)
  await page.clock.runFor(1)
  await expect(page.getByText('Searching...', { exact: true })).toBeVisible()
  await requests(page, 1, 0)
  // Let Query notify after the fake request resolves.
  await page.clock.runFor(501)
  await expect(
    page.getByText('Matches for "data": 2', { exact: true }),
  ).toBeVisible()
  await expect(results).toHaveText([
    'Prefetching data on hover',
    'Keeping previous data while fetching',
  ])

  // The previous results stay visible while the next term loads.
  await input.pressSequentially(' on')
  await page.clock.runFor(300)
  await requests(page, 2, 0)
  await expect(results).toHaveCount(2)

  // A newer term cancels the search that is still running.
  await page.clock.runFor(100)
  await input.pressSequentially(' h')
  await page.clock.runFor(300)
  await requests(page, 3, 1)
  // Let Query notify after the fake request resolves.
  await page.clock.runFor(501)
  await expect(
    page.getByText('Matches for "data on h": 1', { exact: true }),
  ).toBeVisible()
  await expect(results).toHaveText(['Prefetching data on hover'])

  // Returning to a cached term shows its results without a request.
  await input.fill('data')
  await page.clock.runFor(300)
  await expect(
    page.getByText('Matches for "data": 2', { exact: true }),
  ).toBeVisible()
  await requests(page, 3, 1)
})

test('shows the search debouncer in the Pacer devtools next to the Query panel', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  await expectPacerDevtools(
    page,
    async () => {
      await page.getByLabel('Search posts').pressSequentially('q')
      await page.clock.runFor(1)
    },
    'Post Search Debouncer',
    // The Vue devtools host ignores `defaultOpen`, so open the panel by hand.
    { openFromPluginStrip: true },
  )
  // Let the debounced search run so its query appears in the Query panel.
  await page.clock.runFor(300)
  await page
    .getByRole('navigation', { name: 'Plugin panels' })
    .getByRole('button', { name: 'TanStack Query', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: /^Query key \["posts","search","q+"\]$/ }),
  ).toBeVisible()
})
