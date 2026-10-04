import { readdirSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const root = import.meta.dirname
const selectedTestDir = process.env.PLAYWRIGHT_TEST_DIR
const exampleDirs = selectedTestDir
  ? [path.resolve(selectedTestDir, '../..')]
  : [
      'react',
      'preact',
      'solid',
      'angular',
      'vue',
      'svelte',
      'lit',
      'alpine',
      'ember',
      'octane',
    ].flatMap((framework) =>
      readdirSync(path.join(root, 'examples', framework), {
        withFileTypes: true,
      })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(root, 'examples', framework, entry.name))
        .sort(),
    )

function projectName(exampleDir: string) {
  return `${path.basename(path.dirname(exampleDir))}/${path.basename(exampleDir)}`
}

export default defineConfig({
  // Nx runs one process per example. Each process owns its failure artifacts.
  outputDir: path.join(
    root,
    'test-results',
    selectedTestDir ? projectName(exampleDirs[0]!) : 'all',
  ),
  testMatch: '**/*.spec.{ts,mts}',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: 'list',
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: exampleDirs.map((exampleDir) => ({
    name: projectName(exampleDir),
    testDir: path.join(exampleDir, 'tests/e2e'),
    use: { ...devices['Desktop Chrome'] },
  })),
})
