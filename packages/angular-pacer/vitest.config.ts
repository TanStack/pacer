import { fileURLToPath } from 'node:url'
import angular from '@analogjs/vite-plugin-angular'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [
    angular({
      tsconfig: fileURLToPath(new URL('./tsconfig.spec.json', import.meta.url)),
      jit: false,
    }),
  ],
  test: {
    name: packageJson.name,
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    setupFiles: [fileURLToPath(new URL('./test-setup.ts', import.meta.url))],
    watch: false,
    environment: 'jsdom',
    globals: true,
    restoreMocks: true,
  },
})
