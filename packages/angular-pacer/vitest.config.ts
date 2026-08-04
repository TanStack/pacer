import { defineConfig } from 'vitest/config'
import angular from '@analogjs/vite-plugin-angular'
import { fileURLToPath } from 'node:url'
import packageJson from './package.json' with { type: 'json' }

const packageRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    angular({
      workspaceRoot: packageRoot,
      tsconfig: fileURLToPath(new URL('./tsconfig.vitest.json', import.meta.url)),
      include: ['/tests/**/*.ts'],
    }),
  ],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/test-setup.ts'],
  },
})
