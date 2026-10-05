import path from 'node:path'
import { test as base, expect } from '@playwright/test'
import { startExampleServer } from './startExampleServer'

export { expect } from '@playwright/test'

export const test = base.extend<{}, { exampleUrl: string }>({
  exampleUrl: [
    // Playwright discovers fixture dependencies from this destructured parameter.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const exampleDir = path.resolve(workerInfo.project.testDir, '../..')
      const server = await startExampleServer(exampleDir)
      try {
        await use(server.url)
      } finally {
        await server.close()
      }
    },
    { scope: 'worker', timeout: 120_000 },
  ],
  page: async ({ page }, use, testInfo) => {
    const errors: Array<string> = []
    page.on('pageerror', (error) => errors.push(error.message))
    // Development diagnostics are unrelated to example behavior and fetch a CDN.
    await page.route('https://unpkg.com/react-scan/**', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    )
    await use(page)
    if (errors.length) {
      await testInfo.attach('page-errors', {
        body: errors.join('\n'),
        contentType: 'text/plain',
      })
    }
    expect(errors, 'Unexpected browser errors').toEqual([])
  },
})
