import { expect, it } from 'vitest'
import packageJson from '../package.json' with { type: 'json' }
import storePackage from '../node_modules/@tanstack/angular-store/package.json' with { type: 'json' }

it('advertises a minimum Angular version supported by its required store adapter', () => {
  const minimumMajor = (range: string) => Number(range.match(/\d+/)?.[0])
  expect(
    minimumMajor(packageJson.peerDependencies['@angular/core']),
  ).toBeGreaterThanOrEqual(
    minimumMajor(storePackage.peerDependencies['@angular/core']),
  )
})
