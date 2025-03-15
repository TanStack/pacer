import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackViteConfig } from '@tanstack/config/vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

const config = defineConfig({
  plugins: [react()],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    // setupFiles: ['./tests/test-setup.ts'],
    globals: true,
  },
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: [
      './src/index.ts',
      './src/async-throttler/index.ts',
      './src/async-queuer/index.ts',
      './src/async-debouncer/index.ts',
      './src/debouncer/index.ts',
      './src/queue/index.ts',
      './src/throttler/index.ts',
    ],
    srcDir: './src',
  }),
)
