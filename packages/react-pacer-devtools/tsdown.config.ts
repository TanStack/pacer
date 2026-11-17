import react from '@vitejs/plugin-react'
import { defineConfig } from 'tsdown'

export default defineConfig({
  plugins: [react()],
  entry: ['./src/index.ts', './src/production.ts'],
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
