import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    name: '@tanstack/ember-pacer',
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    include: ['**/*.test.ts'],
    watch: false,
  },
})
