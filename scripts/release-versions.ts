import { gt, prerelease, rcompare, valid } from 'semver'

interface PublishedVersion {
  deprecated?: string
}

export interface RegistryPackage {
  'dist-tags'?: { latest?: string }
  versions?: Record<string, PublishedVersion>
}

export function checkReleaseVersion(
  name: string,
  version: string,
  metadata: RegistryPackage,
): void {
  if (!valid(version))
    throw new Error(`${name} has an invalid version: ${version}`)
  // Prereleases use their own distribution tag and do not advance latest.
  if (prerelease(version)) return
  const versions = Object.entries(metadata.versions ?? {})
    .filter(
      ([published, info]) =>
        valid(published) && !prerelease(published) && !info.deprecated,
    )
    .map(([published]) => published)
    .sort(rcompare)
  const highest = versions[0]
  if (highest && gt(highest, version)) {
    throw new Error(
      `${name}@${version} is below the highest non-deprecated stable release, ${highest}. Resolve the version history before publishing.`,
    )
  }
}

export async function readRegistryPackage(
  name: string,
): Promise<RegistryPackage> {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}`,
    { signal: AbortSignal.timeout(30_000) },
  )
  if (response.status === 404) return {}
  if (!response.ok) {
    throw new Error(
      `Cannot verify ${name}: npm registry HTTP ${response.status}`,
    )
  }
  return response.json() as Promise<RegistryPackage>
}
