import { expectPacerDevtools } from '../../../../../tests/e2e/helpers/devtools'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import type { Page } from '@playwright/test'

const posts = [
  { id: 1, title: 'Alpha post', body: 'Alpha content' },
  { id: 2, title: 'Beta post', body: 'Beta content' },
  { id: 3, title: 'Gamma post', body: 'Gamma content' },
  { id: 4, title: 'Delta post', body: 'Delta content' },
]

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
})

async function openExample(page: Page, exampleUrl: string) {
  const requestedPosts: Array<number> = []
  await page.route('https://jsonplaceholder.typicode.com/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/posts') {
      await route.fulfill({ json: posts })
      return
    }
    const id = Number(pathname.split('/').at(-1))
    const post = posts.find((item) => item.id === id)
    requestedPosts.push(id)
    await route.fulfill({ status: post ? 200 : 404, json: post ?? {} })
  })
  const listResponse = page.waitForResponse(
    'https://jsonplaceholder.typicode.com/posts',
  )
  await page.goto(exampleUrl)
  // Let frameworks that run effects after a paint, such as Preact, catch up.
  await page.clock.runFor(17)
  await (await listResponse).finished()
  // Flush Query's notification scheduled after the mocked fetch resolves.
  await page.clock.runFor(1)
  await expect(
    page.getByRole('link', { name: 'Alpha post', exact: true }),
  ).toBeVisible()
  // Let frameworks that run effects after a paint, such as Preact, catch up.
  await page.clock.runFor(17)
  return requestedPosts
}

test('renders the mocked post list without fetching details', async ({
  page,
  exampleUrl,
}) => {
  const requestedPosts = await openExample(page, exampleUrl)
  await expect(
    page.getByRole('heading', {
      name: 'TanStack Pacer/Query Queued Prefetch Example',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link')).toHaveText(
    posts.map((post) => post.title),
  )
  expect(requestedPosts).toEqual([])
})

test('runs at most two prefetches at once, newest hover first', async ({
  page,
  exampleUrl,
}) => {
  const requestedPosts = await openExample(page, exampleUrl)
  for (const title of [
    'Alpha post',
    'Beta post',
    'Gamma post',
    'Delta post',
    // Already queued, so it is not added again.
    'Gamma post',
  ]) {
    await page.getByRole('link', { name: title, exact: true }).hover()
    await page.clock.runFor(1)
  }
  await expect(
    page.getByText('Prefetching: 1, 2 | Queued: 4, 3', { exact: true }),
  ).toBeVisible()

  await page.clock.runFor(500)
  await expect.poll(() => requestedPosts).toEqual([1, 2])
  // The two free slots go to the newest hovers.
  await expect(
    page.getByText('Prefetching: 4, 3 | Queued: none', { exact: true }),
  ).toBeVisible()
  await page.clock.runFor(500)
  await expect.poll(() => requestedPosts).toEqual([1, 2, 4, 3])
  await expect(
    page.getByText('Prefetching: none | Queued: none', { exact: true }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Beta post', exact: true }).click()
  await page.clock.runFor(1)
  await expect(page.getByText('Beta content', { exact: true })).toBeVisible()
  await page.clock.runFor(600)
  expect(requestedPosts).toEqual([1, 2, 4, 3])
})

test('shows the prefetcher in the Pacer devtools next to the Query panel', async ({
  page,
  exampleUrl,
}) => {
  await openExample(page, exampleUrl)
  // Let frames run as in a real browser. Preact's devtools host crashes when
  // a plugin re-renders before the previous frame's effects run.
  await page.clock.resume()
  const titles = ['Alpha post', 'Beta post']
  let hovered = 0
  await expectPacerDevtools(
    page,
    async () => {
      // Hover a different post each time so the queued prefetcher updates.
      const title = titles[hovered++ % titles.length]!
      await page.getByRole('link', { name: title, exact: true }).hover()
      await page.clock.runFor(1)
    },
    'Post Prefetch Queue',
  )
  await page
    .getByRole('button', { name: 'TanStack Query', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Query key ["posts"]', exact: true }),
  ).toBeVisible()
})
