import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './packages/pacer/vite.config.ts',
      './packages/pacer-lite/vite.config.ts',
      './packages/preact-pacer/vitest.config.ts',
      './packages/preact-pacer-devtools/vitest.config.ts',
      './packages/react-pacer/vite.config.ts',
      './packages/react-pacer-devtools/vite.config.ts',
      './packages/solid-pacer/vite.config.ts',
      './packages/solid-pacer-devtools/vite.config.ts',
    ],
  },
})
