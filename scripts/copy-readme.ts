import { copyFile, readdir } from 'node:fs/promises'

for (const entry of await readdir('packages', { withFileTypes: true })) {
  if (entry.isDirectory())
    await copyFile('README.md', `packages/${entry.name}/README.md`)
}
