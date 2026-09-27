import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateReferenceDocs } from '@tanstack/typedoc-config'
import { glob } from 'tinyglobby'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await generateReferenceDocs({
  packages: [
    {
      name: 'pacer',
      entryPoints: [resolve(__dirname, '../packages/pacer/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/pacer/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/reference'),
    },
    {
      name: 'preact-pacer',
      entryPoints: [
        resolve(__dirname, '../packages/preact-pacer/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/preact-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/preact/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'react-pacer',
      entryPoints: [resolve(__dirname, '../packages/react-pacer/src/index.ts')],
      tsconfig: resolve(
        __dirname,
        '../packages/react-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/react/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'solid-pacer',
      entryPoints: [resolve(__dirname, '../packages/solid-pacer/src/index.ts')],
      tsconfig: resolve(
        __dirname,
        '../packages/solid-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/solid/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'angular-pacer',
      entryPoints: [
        resolve(__dirname, '../packages/angular-pacer/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/angular-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/angular/reference'),
      exclude: ['packages/pacer/**/*'],
    },
  ],
})

// TypeDoc can leave trailing spaces in multiline signatures. Preserve Markdown
// hard breaks outside code fences while keeping generated code whitespace clean.
for (const file of await glob('docs/**/reference/**/*.md')) {
  let inCodeBlock = false
  const markdown = await readFile(file, 'utf8')
  const cleaned = markdown
    .split('\n')
    .map((line) => {
      if (line.startsWith('```')) inCodeBlock = !inCodeBlock
      return inCodeBlock ? line.trimEnd() : line
    })
    .join('\n')
  if (cleaned !== markdown) await writeFile(file, cleaned)
}

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
