import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const examples = readdirSync(path.join(root, 'examples/react'), {
  withFileTypes: true,
}).filter((entry) => entry.isDirectory())

// Ask the runner what it discovers, rather than counting files that might never run.
const result = spawnSync(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test', '--list', '--reporter=json'],
  {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, PLAYWRIGHT_TEST_DIR: '' },
  },
)
assert.equal(result.status, 0, result.stderr || result.stdout)
const report = JSON.parse(result.stdout) as {
  suites: Array<Suite>
}
interface Suite {
  suites?: Array<Suite>
  specs?: Array<{ tests: Array<{ projectName: string }> }>
}
const counts = new Map<string, number>()
function visit(suite: Suite): void {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      counts.set(test.projectName, (counts.get(test.projectName) ?? 0) + 1)
    }
  }
  for (const child of suite.suites ?? []) visit(child)
}
for (const suite of report.suites) visit(suite)

for (const example of examples) {
  const manifest = JSON.parse(
    readFileSync(
      path.join(root, 'examples/react', example.name, 'package.json'),
      'utf8',
    ),
  ) as { scripts?: Record<string, string> }
  assert.ok(
    manifest.scripts?.['test:e2e'],
    `${example.name} needs a test:e2e script`,
  )
  assert.ok(
    (counts.get(`react/${example.name}`) ?? 0) >= 2,
    `${example.name} needs a smoke test and a functionality test`,
  )
}
console.log(`Verified e2e discovery for all ${examples.length} React examples.`)
