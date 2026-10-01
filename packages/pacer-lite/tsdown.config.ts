import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/lite-batcher.ts',
    './src/lite-debouncer.ts',
    './src/lite-queuer.ts',
    './src/lite-rate-limiter.ts',
    './src/lite-throttler.ts',
  ],
  format: ['esm'],
  target: 'es2022',
  unbundle: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  fixedExtension: false,
  exports: true,
  publint: {
    strict: true,
  },
})
