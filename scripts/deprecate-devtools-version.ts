import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const name = '@tanstack/react-pacer-devtools'
const version = '0.14.0'
const target = `${name}@${version}`
const message =
  'This version was published accidentally and contains an obsolete devtools implementation. Install @tanstack/react-pacer-devtools@latest instead.'
const arguments_ = process.argv.slice(2)
assert.ok(
  arguments_.length === 0 ||
    (arguments_.length === 1 && arguments_[0] === '--apply'),
  'Usage: pnpm release:deprecate-devtools [--apply]',
)

const manifest = JSON.parse(
  execFileSync('npm', ['view', target, '--json'], { encoding: 'utf8' }),
) as { name: string; version: string; dependencies?: Record<string, string> }
assert.equal(manifest.name, name)
assert.equal(manifest.version, version)
assert.equal(
  manifest.dependencies?.['@tanstack/pacer-devtools'],
  '0.14.0',
  'The package no longer matches the accidental release documented in #168',
)

console.log(`Deprecation target: ${target}`)
console.log(`Message: ${message}`)
if (arguments_[0] === '--apply') {
  execFileSync('npm', ['deprecate', target, message], { stdio: 'inherit' })
} else {
  console.log('Preview only. Add --apply to update this one version on npm.')
}
