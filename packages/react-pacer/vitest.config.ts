import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react()],
  test: {
    name: packageJson.name,
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    watch: false,
    environment: 'happy-dom',
    // setupFiles: ['./tests/test-setup.ts'],
    globals: true,
  },
})
