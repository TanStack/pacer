import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/config/typedoc'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('@tanstack/config/typedoc').Package[]} */
const packages = [
  {
    name: 'bouncer',
    entryPoints: [resolve(__dirname, '../packages/bouncer/src/index.ts')],
    tsconfig: resolve(__dirname, '../packages/bouncer/tsconfig.docs.json'),
    outputDir: resolve(__dirname, '../docs/reference'),
  },
  {
    name: 'react-bouncer',
    entryPoints: [resolve(__dirname, '../packages/react-bouncer/src/index.ts')],
    tsconfig: resolve(
      __dirname,
      '../packages/react-bouncer/tsconfig.docs.json',
    ),
    outputDir: resolve(__dirname, '../docs/framework/react/reference'),
    exclude: ['packages/bouncer/**/*'],
  },
]

await generateReferenceDocs({ packages })

process.exit(0)
