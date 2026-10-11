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
    {
      name: 'vue-pacer',
      entryPoints: [resolve(__dirname, '../packages/vue-pacer/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/vue-pacer/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/framework/vue/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'svelte-pacer',
      entryPoints: [
        resolve(__dirname, '../packages/svelte-pacer/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/svelte-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/svelte/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'lit-pacer',
      entryPoints: [resolve(__dirname, '../packages/lit-pacer/src/index.ts')],
      tsconfig: resolve(__dirname, '../packages/lit-pacer/tsconfig.docs.json'),
      outputDir: resolve(__dirname, '../docs/framework/lit/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'alpine-pacer',
      entryPoints: [
        resolve(__dirname, '../packages/alpine-pacer/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/alpine-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/alpine/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'ember-pacer',
      entryPoints: [resolve(__dirname, '../packages/ember-pacer/src/index.ts')],
      tsconfig: resolve(
        __dirname,
        '../packages/ember-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/ember/reference'),
      exclude: ['packages/pacer/**/*'],
    },
    {
      name: 'octane-pacer',
      entryPoints: [
        resolve(__dirname, '../packages/octane-pacer/src/index.ts'),
      ],
      tsconfig: resolve(
        __dirname,
        '../packages/octane-pacer/tsconfig.docs.json',
      ),
      outputDir: resolve(__dirname, '../docs/framework/octane/reference'),
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
      // A single trailing space is never a Markdown hard break.
      return inCodeBlock || /[^ ] $/.test(line) ? line.trimEnd() : line
    })
    .join('\n')
  if (cleaned !== markdown) await writeFile(file, cleaned)
}

console.log('\n✅ All markdown files have been processed!')

process.exit(0)
