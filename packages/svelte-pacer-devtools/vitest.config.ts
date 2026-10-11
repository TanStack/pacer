import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  resolve: { conditions: ['browser'] },
  test: {
    name: '@tanstack/svelte-pacer-devtools',
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    watch: false,
    environment: 'happy-dom',
    globals: true,
  },
})
