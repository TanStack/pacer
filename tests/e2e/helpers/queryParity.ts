import { fileURLToPath } from 'node:url'
import { expect, test } from './fixtures'
import { startExampleServer } from './startExampleServer'
import { expectMatchingExampleLayout } from './parity'
import type { Page } from '@playwright/test'

/** Compare loaded post lists without relying on the external demo API. */
export function testQueryLayout(reactExample: URL, root: string) {
  test('matches React post-list layout and styles at desktop and phone widths', async ({
    page,
    exampleUrl,
    context,
  }) => {
    const server = await startExampleServer(fileURLToPath(reactExample))
    const baseline = await context.newPage()
    try {
      for (const current of [page, baseline]) {
        await current.route('https://unpkg.com/react-scan/**', (route) =>
          route.fulfill({ contentType: 'application/javascript', body: '' }),
        )
        await current.route(
          'https://jsonplaceholder.typicode.com/posts',
          (route) =>
            route.fulfill({
              json: [
                { id: 1, title: 'Alpha post', body: 'Alpha content' },
                { id: 2, title: 'Beta post', body: 'Beta content' },
                { id: 3, title: 'Gamma post', body: 'Gamma content' },
              ],
            }),
        )
        await current.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
        await current.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
        const list = current.waitForResponse(
          'https://jsonplaceholder.typicode.com/posts',
        )
        await current.goto(current === page ? exampleUrl : server.url)
        // Let frameworks that run effects after a paint, such as Preact, start
        // the request.
        await current.clock.runFor(17)
        await (await list).finished()
        await current.clock.runFor(20)
        await expect(
          current.getByRole('link', { name: 'Alpha post', exact: true }),
        ).toBeVisible()
      }
      await expectMatchingExampleLayout(page, baseline, root)
    } finally {
      await baseline.close()
      await server.close()
    }
  })
}

/** Compare examples that use an in-memory fake API instead of the network. */
export function testLocalQueryLayout(
  reactExample: URL,
  root: string,
  ready: (page: Page) => Promise<void>,
) {
  test('matches React layout and styles at desktop and phone widths', async ({
    page,
    exampleUrl,
    context,
  }) => {
    const server = await startExampleServer(fileURLToPath(reactExample))
    const baseline = await context.newPage()
    try {
      for (const current of [page, baseline]) {
        await current.route('https://unpkg.com/react-scan/**', (route) =>
          route.fulfill({ contentType: 'application/javascript', body: '' }),
        )
        await current.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
        await current.clock.pauseAt(new Date('2026-01-01T00:00:01Z'))
        await current.goto(current === page ? exampleUrl : server.url)
        await ready(current)
      }
      await expectMatchingExampleLayout(page, baseline, root)
    } finally {
      await baseline.close()
      await server.close()
    }
  })
}

/** Waits for the debounced search example's input. */
export async function searchReady(page: Page) {
  await expect(page.getByLabel('Search posts')).toBeVisible()
}

/** Waits for the autosave example to load its note. */
export async function autosaveReady(page: Page) {
  await expect(page.getByText('Loading note...', { exact: true })).toBeVisible()
  // Let frameworks that run effects after a paint, such as Preact, start the
  // request.
  await page.clock.runFor(17)
  // Let Query notify after the fake request resolves.
  await page.clock.runFor(301)
  await expect(
    page.getByRole('textbox', { name: 'Note', exact: true }),
  ).toBeVisible()
}
