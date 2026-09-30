import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { createVitest } from 'vitest/node'

const packageDirectories = readdirSync('packages', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => resolve('packages', entry.name))
const expectedNames = packageDirectories.map((directory) => {
  const manifest = JSON.parse(
    readFileSync(join(directory, 'package.json'), 'utf8'),
  ) as { name: string }
  return manifest.name
})

const context = await createVitest({ watch: false })
try {
  assert.deepEqual(
    context.projects.map((project) => project.name).sort(),
    expectedNames.sort(),
    'The root Vitest configuration must load every package project',
  )

  const specifications = await context.globTestSpecifications()
  assert.ok(specifications.length > 0, 'No package tests were discovered')
  const testFiles = new Set<string>()
  for (const specification of specifications) {
    const testsDirectory = join(specification.project.config.root, 'tests')
    assert.ok(
      specification.moduleId.startsWith(testsDirectory + sep),
      `${specification.project.name} collected a test outside its package: ${specification.moduleId}`,
    )
    assert.ok(
      !testFiles.has(specification.moduleId),
      `Multiple projects collected ${specification.moduleId}`,
    )
    testFiles.add(specification.moduleId)
  }
  console.log(
    `Verified ${context.projects.length} Vitest projects and ${testFiles.size} package test files`,
  )
} finally {
  await context.close()
}
