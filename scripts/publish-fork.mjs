#!/usr/bin/env node

// publish-fork.mjs — Publishes this TanStack Pacer fork to npm under the @klinking scope.
//
// Problem:
//   Source code uses @tanstack/* import paths (e.g. `import { Debouncer } from '@tanstack/pacer'`).
//   If we just rename packages to @klinking/*, the built JS still contains `@tanstack/pacer`
//   imports — which consumers won't have installed.
//
// Solution:
//   npm package aliases. In the published @klinking/react-pacer package.json, we declare:
//     "dependencies": { "@tanstack/pacer": "npm:@klinking/pacer@0.19.0" }
//   This tells npm: "when code asks for @tanstack/pacer, install @klinking/pacer instead."
//   The built import paths work unchanged. This is a standard npm/pnpm/yarn feature.
//
// What this script does (in order):
//   1. Scans packages/ to find the 10 internal pacer packages and their versions
//   2. Builds everything (while workspace:* resolution is still intact)
//   3. Rewrites each package.json:
//      - name:  @tanstack/X  →  @klinking/X
//      - internal deps:  "workspace:*"  →  "npm:@klinking/X@<version>"
//      - internal peer deps with semver ranges:  ">=0.16.4"  →  "npm:@klinking/X@>=0.16.4"
//      - external @tanstack/* deps (store, devtools-ui, etc.) are LEFT UNTOUCHED
//   4. Publishes each package to npm
//   5. Reverts all package.json changes via git checkout
//
// Usage:
//   pnpm publish:fork                              # publish all for real
//   pnpm publish:fork -- --dry-run                  # npm dry-run (no actual publish)
//   pnpm publish:fork -- --only pacer,react-pacer   # publish only specified package dirs
//
// Prerequisites:
//   - `npm login` (authenticated to npm)
//   - @klinking org exists on npmjs.com
//   - `npm whoami` shows your username

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PACKAGES_DIR = join(ROOT, 'packages')

// These are the 10 packages in this repo that we publish under @klinking.
// Everything else under @tanstack/* (store, react-store, devtools-ui, etc.)
// is an external dependency published by TanStack — we leave those as-is.
const INTERNAL_PACKAGES = new Set([
  '@tanstack/pacer',
  '@tanstack/pacer-lite',
  '@tanstack/pacer-devtools',
  '@tanstack/react-pacer',
  '@tanstack/react-pacer-devtools',
  '@tanstack/solid-pacer',
  '@tanstack/solid-pacer-devtools',
  '@tanstack/preact-pacer',
  '@tanstack/preact-pacer-devtools',
  '@tanstack/angular-pacer',
])

/** @tanstack/react-pacer → @klinking/react-pacer */
function toKlinking(name) {
  return name.replace('@tanstack/', '@klinking/')
}

/** Run a shell command, printing it first for visibility. */
function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts })
}

function main() {
  const dryRun = process.argv.includes('--dry-run')

  // --only dir1,dir2,... — only publish these package directories (build & rewrite still run for all)
  const onlyIdx = process.argv.indexOf('--only')
  const onlyDirs =
    onlyIdx !== -1 && process.argv[onlyIdx + 1]
      ? new Set(process.argv[onlyIdx + 1].split(','))
      : null

  // ── Step 1: Discover packages and build a version map ─────────────────
  // We need versions up front so we can write exact version aliases like
  // "npm:@klinking/pacer@0.19.0" when replacing "workspace:*" references.
  const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const versionMap = new Map() // e.g. "@tanstack/pacer" → "0.19.0"
  const packageJsonPaths = []

  for (const dir of packageDirs) {
    const pkgPath = join(PACKAGES_DIR, dir, 'package.json')
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (INTERNAL_PACKAGES.has(pkg.name)) {
        versionMap.set(pkg.name, pkg.version)
        packageJsonPaths.push(pkgPath)
      }
    } catch {
      // Skip directories without package.json
    }
  }

  console.log('Package versions:')
  for (const [name, version] of versionMap) {
    console.log(`  ${name} @ ${version}`)
  }

  // ── Step 2: Build ─────────────────────────────────────────────────────
  // Build BEFORE rewriting package.json so that pnpm workspace:* resolution
  // still works. The build output (dist/) uses @tanstack/* import paths which
  // is exactly what we want — the npm aliases will redirect them at install time.
  console.log('\n=== Building all packages ===')
  run('pnpm build:all')

  // ── Step 3: Rewrite package.json files ────────────────────────────────
  // Temporarily mutate each package.json for publishing. Changes:
  //   - "name" field: @tanstack/X → @klinking/X
  //   - Internal deps: "workspace:*" → "npm:@klinking/X@<exact-version>"
  //   - Internal peer deps with semver: ">=0.16.4" → "npm:@klinking/X@>=0.16.4"
  // External deps like @tanstack/store are NOT touched.
  console.log('\n=== Rewriting package.json files ===')
  for (const pkgPath of packageJsonPaths) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const originalName = pkg.name

    pkg.name = toKlinking(pkg.name)
    console.log(`\n${originalName} -> ${pkg.name}`)

    for (const depType of [
      'dependencies',
      'peerDependencies',
      'devDependencies',
    ]) {
      if (!pkg[depType]) continue

      for (const [dep, value] of Object.entries(pkg[depType])) {
        // Only rewrite deps that point to our internal packages.
        // External @tanstack/* packages (store, react-store, devtools-ui, etc.)
        // are real npm packages that consumers install normally.
        if (!INTERNAL_PACKAGES.has(dep)) continue

        const klinkingName = toKlinking(dep)
        const version = versionMap.get(dep)

        if (value === 'workspace:*') {
          // workspace:* is pnpm's local linking syntax — replace with an npm
          // alias pointing to the exact version we're about to publish.
          // e.g. "@tanstack/pacer": "npm:@klinking/pacer@0.19.0"
          pkg[depType][dep] = `npm:${klinkingName}@${version}`
        } else {
          // Already a semver range (e.g. ">=0.16.4" in peerDependencies).
          // Keep the range but redirect to the @klinking package.
          // e.g. "@tanstack/pacer": "npm:@klinking/pacer@>=0.16.4"
          pkg[depType][dep] = `npm:${klinkingName}@${value}`
        }
        console.log(`  ${depType}.${dep}: ${value} -> ${pkg[depType][dep]}`)
      }
    }

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  // ── Step 4: Publish ───────────────────────────────────────────────────
  // --access public: required for scoped packages on first publish
  // --provenance: publish with provenance attestation (requires OIDC, i.e. GitHub Actions)
  console.log('\n=== Publishing packages ===')
  const inCI = Boolean(process.env.CI)
  const publishFlags = ['--access', 'public']
  if (inCI) {
    publishFlags.push('--provenance')
  } else {
    publishFlags.push('--no-provenance')
  }
  if (dryRun) publishFlags.push('--dry-run')

  // When --only is specified, only publish those package directories
  const publishPaths = onlyDirs
    ? packageJsonPaths.filter((p) => {
        const dir = p.split('/').at(-2)
        return onlyDirs.has(dir)
      })
    : packageJsonPaths

  if (onlyDirs) {
    console.log(`Filtering to: ${[...onlyDirs].join(', ')}`)
  }

  for (const pkgPath of publishPaths) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const pkgDir = dirname(pkgPath)
    console.log(`\nPublishing ${pkg.name}@${pkg.version}...`)
    try {
      run(`npm publish ${publishFlags.join(' ')}`, { cwd: pkgDir })
    } catch (e) {
      console.error(`Failed to publish ${pkg.name}: ${e.message}`)
    }
  }

  // ── Step 5: Revert ────────────────────────────────────────────────────
  // Undo all package.json mutations so the working tree stays clean.
  // Source code was never modified — only package.json files were touched.
  console.log('\n=== Reverting changes ===')
  run('git checkout -- packages/')

  console.log('\nDone!')
}

try {
  main()
} catch (e) {
  console.error(e)
  // Always try to revert on error so we don't leave the repo in a dirty state
  try {
    run('git checkout -- packages/')
  } catch {}
  process.exit(1)
}
