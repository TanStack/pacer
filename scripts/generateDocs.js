import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/config/typedoc'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('@tanstack/config/typedoc').Package[]} */
const packages = [
  {
    name: 'pacer',
    entryPoints: [resolve(__dirname, '../packages/pacer/src/index.ts')],
    tsconfig: resolve(__dirname, '../packages/pacer/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/reference'),
  },
  {
    name: 'react-pacer',
    entryPoints: [resolve(__dirname, '../packages/react-pacer/src/index.ts')],
    tsconfig: resolve(__dirname, '../packages/react-pacer/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/framework/react/reference'),
    exclude: ['packages/pacer/**/*'],
  },
  {
    name: 'solid-pacer',
    entryPoints: [resolve(__dirname, '../packages/solid-pacer/src/index.ts')],
    tsconfig: resolve(__dirname, '../packages/solid-pacer/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/framework/solid/reference'),
    exclude: ['packages/pacer/**/*'],
  },
]

await generateReferenceDocs({ packages })

process.exit(0)
