import { defineConfig, mergeConfig } from 'vitest/config'
import { tanstackViteConfig } from '@tanstack/config/vite'
import vue from '@vitejs/plugin-vue'
import packageJson from './package.json'

const config = defineConfig({
  plugins: [vue()],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    globals: true,
  },
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: [
      './src/debouncer/index.ts',
      './src/index.ts',
      './src/types/index.ts',
    ],
    srcDir: './src',
  }),
)
