import { defineConfig } from 'tsdown'
import preact from '@preact/preset-vite'

export default defineConfig({
  // Prefresh pulls @prefresh/* into dist under node_modules/.pnpm, which breaks
  // tsdown's publint pack step. Library builds don't need fast refresh.
  plugins: [preact({ prefreshEnabled: false })],
  entry: ['./src/index.ts', './src/production.ts'],
  format: ['esm'],
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
