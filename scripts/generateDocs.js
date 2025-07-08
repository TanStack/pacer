import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { generateReferenceDocs } from '@tanstack/config/typedoc'

import fg from 'fast-glob'

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

// Find all markdown files matching the pattern
const markdownFiles = [
  ...(await fg('docs/reference/**/*.md')),
  ...(await fg('docs/framework/*/reference/**/*.md')),
]

console.log(`Found ${markdownFiles.length} markdown files to process\n`)

// Process each markdown file
markdownFiles.forEach((file) => {
  const content = readFileSync(file, 'utf-8')
  let updatedContent = content
  updatedContent = updatedContent.replaceAll(/\]\(\.\.\//gm, '](../../')
  // updatedContent = content.replaceAll(/\]\(\.\//gm, '](../')
  updatedContent = updatedContent.replaceAll(
    /\]\((?!https?:\/\/|\/\/|\/|\.\/|\.\.\/|#)([^)]+)\)/gm,
    (match, p1) => `](../${p1})`,
  )

  // Write the updated content back to the file
  if (updatedContent !== content) {
    writeFileSync(file, updatedContent, 'utf-8')
    console.log(`Processed file: ${file}`)
  }
})

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
