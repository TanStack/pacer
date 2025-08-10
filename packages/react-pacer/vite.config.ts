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
      './src/async-batcher/index.ts',
      './src/async-debouncer/index.ts',
      './src/async-queuer/index.ts',
      './src/async-rate-limiter/index.ts',
      './src/async-retryer/index.ts',
      './src/async-throttler/index.ts',
      './src/batcher/index.ts',
      './src/debouncer/index.ts',
      './src/index.ts',
      './src/provider/index.ts',
      './src/queuer/index.ts',
      './src/rate-limiter/index.ts',
      './src/throttler/index.ts',
      './src/types/index.ts',
      './src/utils/index.ts',
    ],
    srcDir: './src',
  }),
)
