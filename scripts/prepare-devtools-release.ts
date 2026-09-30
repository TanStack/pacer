import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lt } from 'semver'

const adapters = ['react', 'solid']
const changesetId = 'devtools-release-floor'
const changesetIds = [changesetId, `pre/${changesetId}`]
const floor = '0.14.0'
const nextVersion = '0.15.0'

interface ReleasePlan {
  changesets: Array<{
    id: string
    releases: Array<{ name: string; type: string }>
  }>
  releases: Array<{ name: string; newVersion: string }>
}

// This migration only runs while its dedicated changeset remains pending.
if (changesetIds.some((id) => existsSync(`.changeset/${id}.md`))) {
  const preState = existsSync('.changeset/pre.json')
    ? (JSON.parse(readFileSync('.changeset/pre.json', 'utf8')) as {
        mode: string
      })
    : undefined

  if (preState?.mode === 'pre') {
    console.log('Deferring the devtools release floors until prerelease exit')
  } else {
    const packages = adapters.map((adapter) => {
      const name = `@tanstack/${adapter}-pacer-devtools`
      const path = `packages/${adapter}-pacer-devtools/package.json`
      const original = readFileSync(path, 'utf8')
      const manifest = JSON.parse(original) as { name: string; version: string }
      assert.equal(manifest.name, name)
      assert.ok(
        lt(manifest.version, nextVersion),
        `${name} is already at ${nextVersion} or higher while the migration changeset is pending. Inspect interrupted versioning before continuing.`,
      )
      return { name, path, original, manifest }
    })
    const temporary = mkdtempSync(join(tmpdir(), 'pacer-release-plan-'))
    const planPath = join(temporary, 'plan.json')
    try {
      for (const { path, manifest } of packages) {
        if (lt(manifest.version, floor)) {
          manifest.version = floor
          writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n')
        }
      }
      execFileSync(
        process.execPath,
        [
          fileURLToPath(import.meta.resolve('@changesets/cli/bin.js')),
          'status',
          '--output',
          planPath,
        ],
        { stdio: 'pipe' },
      )
      const plan = JSON.parse(readFileSync(planPath, 'utf8')) as ReleasePlan
      const migration = plan.changesets.find((changeset) =>
        changesetIds.includes(changeset.id),
      )
      for (const { name } of packages) {
        assert.ok(
          migration?.releases.some(
            (release) => release.name === name && release.type === 'minor',
          ),
          `The devtools release-floor changeset must request a minor release for ${name}`,
        )
        assert.equal(
          plan.releases.find((release) => release.name === name)?.newVersion,
          nextVersion,
          `Changesets must plan ${name}@${nextVersion} before the release floor is staged`,
        )
      }
      console.log(
        'Prepared React and Solid devtools: Changesets will release both at 0.15.0',
      )
    } catch (error) {
      for (const { path, original } of packages) writeFileSync(path, original)
      throw error
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  }
}
