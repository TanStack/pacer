import { expectPacerDevtools } from '../../../../../tests/e2e/helpers/devtools'
import { expect, test } from '../../../../../tests/e2e/helpers/fixtures'
import type { Page } from '@playwright/test'

const posts = [
  { id: 1, title: 'Alpha post', body: 'Alpha content' },
  { id: 2, title: 'Beta post', body: 'Beta content' },
  { id: 3, title: 'Gamma post', body: 'Gamma content' },
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
      name: 'TanStack Pacer/Query Debounced Prefetch Example',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link')).toHaveText(
    posts.map((post) => post.title),
  )
  expect(requestedPosts).toEqual([])
})

test('prefetches only the final hover and reuses its cached detail', async ({
  page,
  exampleUrl,
}) => {
  const requestedPosts = await openExample(page, exampleUrl)
  await page.getByRole('link', { name: 'Alpha post', exact: true }).hover()
  await page.clock.runFor(50)
  await page.getByRole('link', { name: 'Beta post', exact: true }).hover()
  await page.clock.runFor(99)
  expect(requestedPosts).toEqual([])

  await page.clock.runFor(1)
  // Give React a turn to start the request after the debounced value commits.
  await page.clock.runFor(1000)
  await expect.poll(() => requestedPosts).toEqual([2])
  await page.clock.runFor(1)
  await page.getByRole('link', { name: 'Beta post', exact: true }).click()
  await page.clock.runFor(1)
  await expect(page.getByText('Beta content', { exact: true })).toBeVisible()
  await page.clock.runFor(1100)
  expect(requestedPosts).toEqual([2])
})

test('cancels the pending prefetch when the pointer leaves the list', async ({
  page,
  exampleUrl,
}) => {
  const requestedPosts = await openExample(page, exampleUrl)
  await page.getByRole('link', { name: 'Alpha post', exact: true }).hover()
  await page.clock.runFor(50)
  await page.getByRole('heading', { name: 'Posts', exact: true }).hover()
  await page.clock.runFor(1100)
  expect(requestedPosts).toEqual([])
})

test('refreshes a stale post when it is hovered again', async ({
  page,
  exampleUrl,
}) => {
  const requestedPosts = await openExample(page, exampleUrl)
  const beta = page.getByRole('link', { name: 'Beta post', exact: true })
  await beta.hover()
  await page.clock.runFor(100)
  await page.clock.runFor(1000)
  await expect.poll(() => requestedPosts).toEqual([2])

  // Hovering again while the post is fresh reuses the cache.
  await page.getByRole('heading', { name: 'Posts', exact: true }).hover()
  await beta.hover()
  await page.clock.runFor(1100)
  expect(requestedPosts).toEqual([2])

  // After the 10s staleTime, the next hover refetches it.
  await page.getByRole('heading', { name: 'Posts', exact: true }).hover()
  await page.clock.runFor(10_000)
  await beta.hover()
  await page.clock.runFor(100)
  await page.clock.runFor(1000)
  await expect.poll(() => requestedPosts).toEqual([2, 2])
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
      // Hover a different post each time so the debounced prefetcher updates.
      const title = titles[hovered++ % titles.length]!
      await page.getByRole('link', { name: title, exact: true }).hover()
      await page.clock.runFor(1)
    },
    'Post Prefetch Debouncer',
  )
  await page
    .getByRole('button', { name: 'TanStack Query', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Query key ["posts"]', exact: true }),
  ).toBeVisible()
})
