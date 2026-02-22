import { defineConfig } from 'vitest/config'
import angular from '@analogjs/vite-plugin-angular'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [angular()],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/test-setup.ts'],
  },
})
