import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { checkReleaseVersion, readRegistryPackage } from './release-versions.ts'

for (const entry of readdirSync('packages', { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const manifest = JSON.parse(
    readFileSync(join('packages', entry.name, 'package.json'), 'utf8'),
  ) as { name: string; version: string; private?: boolean }
  if (manifest.private) continue
  const metadata = await readRegistryPackage(manifest.name)
  checkReleaseVersion(manifest.name, manifest.version, metadata)
  console.log(`Verified release order for ${manifest.name}@${manifest.version}`)
}
