import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkReleaseVersion } from './release-versions.ts'

const name = '@tanstack/react-pacer-devtools'

test('an obsolete higher release is detected even when latest is correct', () => {
  assert.throws(
    () =>
      checkReleaseVersion(name, '0.9.1', {
        'dist-tags': { latest: '0.9.0' },
        versions: { '0.9.0': {}, '0.14.0': {} },
      }),
    /highest non-deprecated stable release, 0\.14\.0/,
  )
})

test('a deprecated accidental release no longer blocks the current release line', () => {
  checkReleaseVersion(name, '0.9.1', {
    versions: { '0.9.0': {}, '0.14.0': { deprecated: 'Accidental release' } },
  })
})

test('version ordering is numeric and includes major and patch changes', () => {
  checkReleaseVersion(name, '0.10.0', { versions: { '0.9.9': {} } })
  checkReleaseVersion(name, '1.0.0', { versions: { '0.99.99': {} } })
  assert.throws(() =>
    checkReleaseVersion(name, '0.9.1', { versions: { '0.9.2': {} } }),
  )
})

test('a partially published release can resume without republishing older versions', () => {
  checkReleaseVersion(name, '0.9.1', { versions: { '0.9.1': {} } })
})

test('first releases and separately tagged prereleases remain valid', () => {
  checkReleaseVersion(name, '0.1.0', {})
  checkReleaseVersion(name, '0.10.0-beta.1', {
    versions: { '0.14.0': {} },
  })
  checkReleaseVersion(name, '0.9.1', { versions: { '1.0.0-beta.1': {} } })
})

test('build metadata does not bypass release ordering and invalid versions fail', () => {
  assert.throws(
    () =>
      checkReleaseVersion(name, '0.9.1+build.1', {
        versions: { '0.14.0+build.2': {} },
      }),
    /below the highest/,
  )
  assert.throws(
    () => checkReleaseVersion(name, 'invalid', {}),
    /invalid version/,
  )
})

test('the deprecation command previews by default and only changes the exact verified version', () => {
  const directory = mkdtempSync(join(tmpdir(), 'pacer-deprecation-test-'))
  const callsFile = join(directory, 'calls.jsonl')
  const manifest = {
    name,
    version: '0.14.0',
    dependencies: { '@tanstack/pacer-devtools': '0.14.0' },
  }
  writeFileSync(
    join(directory, 'npm'),
    `#!/usr/bin/env node
const fs = require('node:fs');
fs.appendFileSync(process.env.PACER_TEST_NPM_CALLS, JSON.stringify(process.argv.slice(2)) + '\\n');
if (process.argv[2] === 'view') console.log(process.env.PACER_TEST_NPM_MANIFEST);
`,
    { mode: 0o755 },
  )
  const run = (args: Array<string>, packageManifest = manifest) => {
    writeFileSync(callsFile, '')
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(
          new URL('./deprecate-devtools-version.ts', import.meta.url),
        ),
        ...args,
      ],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: directory + delimiter + process.env.PATH,
          PACER_TEST_NPM_CALLS: callsFile,
          PACER_TEST_NPM_MANIFEST: JSON.stringify(packageManifest),
        },
      },
    )
    const calls = readFileSync(callsFile, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Array<string>)
    return { result, calls }
  }
  try {
    const preview = run([])
    assert.equal(preview.result.status, 0, preview.result.stderr)
    assert.match(preview.result.stdout, /Preview only/)
    assert.deepEqual(preview.calls, [['view', `${name}@0.14.0`, '--json']])
    const applied = run(['--apply'])
    assert.equal(applied.result.status, 0, applied.result.stderr)
    assert.equal(applied.calls.length, 2)
    assert.deepEqual(applied.calls[1]?.slice(0, 2), [
      'deprecate',
      `${name}@0.14.0`,
    ])
    assert.match(applied.calls[1][2] ?? '', /published accidentally/)
    const wrong = run(['--apply'], { ...manifest, version: '0.9.0' })
    assert.notEqual(wrong.result.status, 0)
    assert.equal(wrong.calls.length, 1)
    const unknown = run(['--all'])
    assert.notEqual(unknown.result.status, 0)
    assert.deepEqual(unknown.calls, [])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
