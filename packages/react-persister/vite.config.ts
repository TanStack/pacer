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
      './src/async-persister/index.ts',
      './src/compare/index.ts',
      './src/index.ts',
      './src/persister/index.ts',
      './src/storage-persister/index.ts',
      './src/types/index.ts',
      './src/utils/index.ts',
    ],
    srcDir: './src',
  }),
)
