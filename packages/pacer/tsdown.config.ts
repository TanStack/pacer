import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/async-batcher.ts',
    './src/async-debouncer.ts',
    './src/async-queuer.ts',
    './src/async-rate-limiter.ts',
    './src/async-retryer.ts',
    './src/async-throttler.ts',
    './src/batcher.ts',
    './src/debouncer.ts',
    './src/event-client.ts',
    './src/queuer.ts',
    './src/rate-limiter.ts',
    './src/throttler.ts',
    './src/types.ts',
    './src/utils.ts',
  ],
  format: ['esm', 'cjs'],
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  fixedExtension: false,
  exports: true,
  publint: {
    strict: true,
  },
})
