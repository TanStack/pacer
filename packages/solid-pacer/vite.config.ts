import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackViteConfig } from '@tanstack/config/vite'
import solid from 'vite-plugin-solid'
import packageJson from './package.json'

const config = defineConfig({
  plugins: [solid()],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'happy-dom',
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
      './src/async-throttler/index.ts',
      './src/batcher/index.ts',
      './src/debouncer/index.ts',
      './src/index.ts',
      './src/queuer/index.ts',
      './src/rate-limiter/index.ts',
      './src/throttler/index.ts',
      './src/types/index.ts',
      './src/utils/index.ts',
    ],
    srcDir: './src',
  }),
)
