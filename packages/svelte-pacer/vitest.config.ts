import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [svelte()],
  resolve: { conditions: ['browser'] },
  test: {
    name: packageJson.name,
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    watch: false,
    environment: 'happy-dom',
    // setupFiles: ['./tests/test-setup.ts'],
    globals: true,
  },
})
