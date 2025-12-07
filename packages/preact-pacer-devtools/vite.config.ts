import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackViteConfig } from '@tanstack/vite-config'
import preact from '@preact/preset-vite'
import packageJson from './package.json'

const config = defineConfig({
  plugins: [preact()],
  test: {
    name: packageJson.name,
    dir: './',
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['./tests/test-setup.ts'],
    globals: true,
  },
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: ['./src/index.ts', './src/production.ts'],
    srcDir: './src',
    cjs: false,
  }),
)
