import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  test: {
    name: '@tanstack/ember-pacer',
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    include: ['**/*.test.ts'],
    watch: false,
  },
})
