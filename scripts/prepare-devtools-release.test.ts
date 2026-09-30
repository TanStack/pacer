import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const name = '@tanstack/react-pacer-devtools'
const changeset = '.changeset/devtools-release-floor.md'
const manifest = 'packages/react-pacer-devtools/package.json'
const solidName = '@tanstack/solid-pacer-devtools'
const solidManifest = 'packages/solid-pacer-devtools/package.json'
const cli = fileURLToPath(import.meta.resolve('@changesets/cli/bin.js'))
const prepare = fileURLToPath(
  new URL('./prepare-devtools-release.ts', import.meta.url),
)

function fixture() {
  const cwd = mkdtempSync(join(tmpdir(), 'pacer-version-test-'))
  const write = (file: string, value: string) => {
    mkdirSync(join(cwd, file, '..'), { recursive: true })
    writeFileSync(join(cwd, file), value)
  }
  const json = (file: string) =>
    JSON.parse(readFileSync(join(cwd, file), 'utf8'))
  write('package.json', JSON.stringify({ name: 'fixture', private: true }))
  write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n')
  write(manifest, JSON.stringify({ name, version: '0.9.0' }))
  write(solidManifest, JSON.stringify({ name: solidName, version: '0.8.0' }))
  write(
    'packages/consumer/package.json',
    JSON.stringify({
      name: 'fixture-consumer',
      version: '1.0.0',
      dependencies: { [name]: 'workspace:^' },
    }),
  )
  write(
    'packages/unrelated/package.json',
    JSON.stringify({
      name: 'fixture-unrelated',
      version: '1.0.0',
    }),
  )
  const config = JSON.parse(
    readFileSync(new URL('../.changeset/config.json', import.meta.url), 'utf8'),
  )
  // Use Changesets' local changelog writer so these tests never need GitHub credentials.
  config.changelog = '@changesets/cli/changelog'
  write('.changeset/config.json', JSON.stringify(config))
  execFileSync('git', ['init', '-q'], { cwd })
  execFileSync('git', ['add', '.'], { cwd })
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.com',
      'commit',
      '-qm',
      'Initial fixture',
    ],
    { cwd },
  )
  const addChangeset = (type = 'minor', file = changeset) =>
    write(
      file,
      `---\n'${name}': ${type}\n'${solidName}': ${type}\n---\n\nSupersede the accidental release with the current implementation.\n`,
    )
  const run = (script: string, ...args: Array<string>) =>
    execFileSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' })
  return {
    cwd,
    write,
    json,
    run,
    addChangeset,
    cleanup: () => rmSync(cwd, { recursive: true, force: true }),
  }
}

test('preparation is a no-op without the dedicated changeset', () => {
  const repo = fixture()
  try {
    repo.run(prepare)
    assert.equal(repo.json(manifest).version, '0.9.0')
  } finally {
    repo.cleanup()
  }
})

test('standard Changesets produces 0.15.0 once, updates dependents and changelogs, then resumes patches', () => {
  const repo = fixture()
  try {
    repo.addChangeset()
    // A second minor changeset must not turn this into an incidental 0.16.0 release.
    repo.addChangeset('minor', '.changeset/another-change.md')
    repo.run(cli, 'status', '--output', 'before.json')
    assert.equal(
      repo
        .json('before.json')
        .releases.find((release: { name: string }) => release.name === name)
        .newVersion,
      '0.10.0',
    )
    repo.run(prepare)
    repo.run(prepare)
    assert.equal(repo.json(manifest).version, '0.14.0')
    assert.equal(repo.json(solidManifest).version, '0.14.0')
    assert.equal(repo.json('packages/unrelated/package.json').version, '1.0.0')
    repo.run(cli, 'status', '--output', 'prepared.json')
    assert.equal(
      repo
        .json('prepared.json')
        .releases.find(
          (release: { name: string }) => release.name === solidName,
        ).newVersion,
      '0.15.0',
    )
    assert.equal(
      repo
        .json('prepared.json')
        .releases.find((release: { name: string }) => release.name === name)
        .newVersion,
      '0.15.0',
    )
    repo.run(cli, 'version')
    assert.equal(repo.json(manifest).version, '0.15.0')
    assert.equal(repo.json(solidManifest).version, '0.15.0')
    assert.equal(repo.json('packages/consumer/package.json').version, '1.0.1')
    assert.equal(
      repo.json('packages/consumer/package.json').dependencies[name],
      'workspace:^',
    )
    const changelog = readFileSync(
      join(repo.cwd, 'packages/react-pacer-devtools/CHANGELOG.md'),
      'utf8',
    )
    assert.match(changelog, /## 0\.15\.0\n/)
    assert.doesNotMatch(changelog, /## 0\.14\.0\n/)
    assert.equal(existsSync(join(repo.cwd, changeset)), false)
    repo.run(prepare)
    assert.equal(repo.json(manifest).version, '0.15.0')
    assert.equal(repo.json(solidManifest).version, '0.15.0')
    repo.addChangeset('patch', '.changeset/next-patch.md')
    repo.run(prepare)
    repo.run(cli, 'version')
    assert.equal(repo.json(manifest).version, '0.15.1')
    assert.equal(repo.json(solidManifest).version, '0.15.1')
    assert.equal(repo.json('packages/unrelated/package.json').version, '1.0.0')
  } finally {
    repo.cleanup()
  }
})

test('an invalid migration changeset restores the original manifest', () => {
  const repo = fixture()
  try {
    repo.addChangeset()
    repo.write(
      changeset,
      readFileSync(join(repo.cwd, changeset), 'utf8').replace(
        `'${solidName}': minor`,
        `'${solidName}': patch`,
      ),
    )
    const original = readFileSync(join(repo.cwd, manifest), 'utf8')
    const result = spawnSync(process.execPath, [prepare], {
      cwd: repo.cwd,
      encoding: 'utf8',
    })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /must request a minor release/)
    assert.equal(readFileSync(join(repo.cwd, manifest), 'utf8'), original)
    assert.equal(repo.json(solidManifest).version, '0.8.0')
  } finally {
    repo.cleanup()
  }
})

test('an unexpected release plan restores the original manifest', () => {
  const repo = fixture()
  try {
    repo.addChangeset()
    repo.addChangeset('major', '.changeset/major-change.md')
    const original = readFileSync(join(repo.cwd, manifest), 'utf8')
    const result = spawnSync(process.execPath, [prepare], {
      cwd: repo.cwd,
      encoding: 'utf8',
    })
    assert.notEqual(result.status, 0)
    assert.match(
      result.stderr,
      /must plan @tanstack\/react-pacer-devtools@0\.15\.0/,
    )
    assert.equal(readFileSync(join(repo.cwd, manifest), 'utf8'), original)
    assert.equal(repo.json(solidManifest).version, '0.8.0')
  } finally {
    repo.cleanup()
  }
})

test('prereleases retain their normal sequence and exit at the stable floor', () => {
  const repo = fixture()
  try {
    repo.addChangeset()
    repo.run(cli, 'pre', 'enter', 'beta')
    repo.run(prepare)
    assert.equal(repo.json(manifest).version, '0.9.0')
    repo.run(cli, 'version')
    assert.equal(repo.json(manifest).version, '0.10.0-beta.0')
    repo.run(prepare)
    assert.equal(repo.json(manifest).version, '0.10.0-beta.0')
    repo.run(cli, 'pre', 'exit')
    repo.run(prepare)
    repo.run(cli, 'version')
    assert.equal(repo.json(manifest).version, '0.15.0')
    assert.equal(repo.json(solidManifest).version, '0.15.0')
  } finally {
    repo.cleanup()
  }
})

test('an interrupted version application cannot accidentally advance a package to 0.16.0', () => {
  const repo = fixture()
  try {
    repo.addChangeset()
    repo.write(manifest, JSON.stringify({ name, version: '0.15.0' }))
    const result = spawnSync(process.execPath, [prepare], {
      cwd: repo.cwd,
      encoding: 'utf8',
    })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Inspect interrupted versioning/)
    assert.equal(repo.json(manifest).version, '0.15.0')
    assert.equal(repo.json(solidManifest).version, '0.8.0')
  } finally {
    repo.cleanup()
  }
})
