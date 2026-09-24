import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

type ExportTarget = string | { [condition: string]: ExportTarget }

interface PackedManifest {
  name: string
  type: string
  types: string
  main?: string
  engines: { node: string }
  files: Array<string>
  exports: Record<string, ExportTarget>
  dependencies?: Record<string, string>
}

// Validate an actual pnpm tarball, not the workspace where unpublished source
// files and stale build output can mask a broken release.
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'pacer-package-'))

try {
  const archive = join(temporaryDirectory, 'package.tgz')
  execFileSync('pnpm', ['pack', '--out', archive], { stdio: 'pipe' })
  const files = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((file) => !file.endsWith('/'))
    .map((file) => file.replace(/^package\//, ''))

  execFileSync('tar', ['-xzf', archive, '-C', temporaryDirectory])
  const packageDirectory = join(temporaryDirectory, 'package')
  const manifest = JSON.parse(
    readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
  ) as PackedManifest

  assert.equal(manifest.type, 'module', 'Packages must be ESM')
  assert.equal(manifest.engines.node, '>=20')
  assert.equal(manifest.types, './dist/index.d.ts')
  assert.equal(manifest.main, undefined, 'Do not restore a legacy main entry')
  assert.deepEqual(manifest.files, ['dist'])
  assert.ok(manifest.exports['.'], 'The package must export its main entry')

  function checkFile(target: string) {
    const file = target.replace(/^\.\//, '')
    assert.ok(files.includes(file), `Missing packed export: ${target}`)
  }

  function checkExport(target: ExportTarget, declaration?: string) {
    if (typeof target === 'string') {
      checkFile(target)
      if (target.endsWith('.js')) {
        checkFile(declaration ?? target.replace(/\.js$/, '.d.ts'))
      }
      return
    }
    assert.ok(
      !('require' in target),
      'CommonJS export conditions are forbidden',
    )
    const types = typeof target.types === 'string' ? target.types : declaration
    for (const value of Object.values(target)) checkExport(value, types)
  }

  checkFile(manifest.types)
  for (const target of Object.values(manifest.exports)) checkExport(target)
  for (const version of Object.values(manifest.dependencies ?? {})) {
    assert.ok(
      !version.startsWith('workspace:'),
      'Unresolved workspace dependency',
    )
  }

  let unpackedBytes = 0
  for (const file of files) {
    assert.ok(
      file.startsWith('dist/') ||
        /^(package\.json|readme(?:\..*)?|licen[cs]e(?:\..*)?|changelog(?:\..*)?)$/i.test(
          file,
        ),
      `Unexpected published file: ${file}`,
    )
    assert.ok(!/(^|\/)src\//.test(file), `Published source directory: ${file}`)
    assert.ok(!/\.(?:cjs|cts|map)$/.test(file), `Legacy output or map: ${file}`)
    assert.ok(
      !/\.[cm]?tsx?$/.test(file) || file.endsWith('.d.ts'),
      `Uncompiled TypeScript: ${file}`,
    )
    const path = join(packageDirectory, file)
    unpackedBytes += statSync(path).size
    if (/\.(?:js|ts|svelte|css)$/.test(file)) {
      assert.ok(
        !/sourceMappingURL\s*=/.test(readFileSync(path, 'utf8')),
        `Published source map reference: ${file}`,
      )
    }
  }

  console.log(
    `${manifest.name}: verified ${files.length} packed files, ${statSync(archive).size} compressed bytes, ${unpackedBytes} unpacked bytes`,
  )
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true })
}
