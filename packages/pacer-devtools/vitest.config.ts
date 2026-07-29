import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: [
      {
        find: '@tanstack/pacer/event-client',
        replacement: fileURLToPath(
          new URL('../pacer/src/event-client.ts', import.meta.url),
        ),
      },
      {
        find: '@tanstack/pacer',
        replacement: fileURLToPath(
          new URL('../pacer/src/index.ts', import.meta.url),
        ),
      },
    ],
  },
  test: {
    name: packageJson.name,
    dir: './',
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['./tests/test-setup.ts'],
    globals: true,
  },
})
