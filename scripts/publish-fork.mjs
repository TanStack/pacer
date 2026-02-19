#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PACKAGES_DIR = join(ROOT, 'packages')

// The 10 internal pacer packages that get renamed to @klinking
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

function toKlinking(name) {
  return name.replace('@tanstack/', '@klinking/')
}

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts })
}

function main() {
  const dryRun = process.argv.includes('--dry-run')

  // 1. Discover internal packages and build version map
  const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const versionMap = new Map() // @tanstack/X -> version
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

  // 2. Build all packages (before rewriting, so workspace resolution works)
  console.log('\n=== Building all packages ===')
  run('pnpm build:all')

  // 3. Rewrite package.json files
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
        if (!INTERNAL_PACKAGES.has(dep)) continue

        const klinkingName = toKlinking(dep)
        const version = versionMap.get(dep)

        if (value === 'workspace:*') {
          // workspace:* -> npm alias with exact version
          pkg[depType][dep] = `npm:${klinkingName}@${version}`
        } else {
          // semver range (e.g. ">=0.16.4") -> npm alias keeping the range
          pkg[depType][dep] = `npm:${klinkingName}@${value}`
        }
        console.log(`  ${depType}.${dep}: ${value} -> ${pkg[depType][dep]}`)
      }
    }

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  // 4. Publish each package
  console.log('\n=== Publishing packages ===')
  const publishFlags = ['--access', 'public', '--no-provenance']
  if (dryRun) publishFlags.push('--dry-run')

  for (const pkgPath of packageJsonPaths) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const pkgDir = dirname(pkgPath)
    console.log(`\nPublishing ${pkg.name}@${pkg.version}...`)
    try {
      run(`npm publish ${publishFlags.join(' ')}`, { cwd: pkgDir })
    } catch (e) {
      console.error(`Failed to publish ${pkg.name}: ${e.message}`)
    }
  }

  // 5. Revert all package.json changes
  console.log('\n=== Reverting changes ===')
  run('git checkout -- packages/')

  console.log('\nDone!')
}

try {
  main()
} catch (e) {
  console.error(e)
  // Always try to revert on error
  try {
    run('git checkout -- packages/')
  } catch {}
  process.exit(1)
}
