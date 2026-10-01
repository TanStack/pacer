import { defineConfig } from 'tsdown'
import solid from 'rolldown-plugin-solid'

const makeSolid = (ssr = false) =>
  solid({ solid: { generate: ssr ? 'ssr' : 'dom' } })

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    target: 'es2022',
    sourcemap: false,
    outDir: 'dist',
    fixedExtension: false,
    plugins: [makeSolid()],
    dts: true,
    clean: true,
  },
  {
    entry: { server: 'src/index.ts' },
    format: ['esm'],
    target: 'es2022',
    sourcemap: false,
    outDir: 'dist',
    fixedExtension: false,
    plugins: [makeSolid(true)],
    dts: false,
    clean: false,
  },
  {
    entry: { 'production/index': 'src/production.ts' },
    format: ['esm'],
    target: 'es2022',
    sourcemap: false,
    outDir: 'dist',
    fixedExtension: false,
    plugins: [makeSolid()],
    dts: true,
    clean: false,
  },
  {
    entry: { 'production/server': 'src/production.ts' },
    format: ['esm'],
    target: 'es2022',
    sourcemap: false,
    outDir: 'dist',
    fixedExtension: false,
    plugins: [makeSolid(true)],
    dts: false,
    clean: false,
  },
])
