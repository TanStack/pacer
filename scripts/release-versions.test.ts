import assert from 'node:assert/strict'
import { test } from 'node:test'
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

test('the prepared floors cannot publish even though the same version exists on npm', () => {
  for (const name of [
    '@tanstack/react-pacer-devtools',
    '@tanstack/solid-pacer-devtools',
  ]) {
    assert.throws(
      () => checkReleaseVersion(name, '0.14.0', { versions: { '0.14.0': {} } }),
      /intermediate release floor/,
    )
    assert.throws(
      () => checkReleaseVersion(name, '0.14.0+build.1', {}),
      /intermediate release floor/,
    )
    checkReleaseVersion(name, '0.15.0', { versions: { '0.14.0': {} } })
  }
})
