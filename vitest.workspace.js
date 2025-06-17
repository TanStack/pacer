import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './packages/pacer/vite.config.ts',
      './packages/persister/vite.config.ts',
      './packages/react-pacer/vite.config.ts',
      './packages/react-persister/vite.config.ts',
      './packages/solid-pacer/vite.config.ts',
    ],
  },
})
