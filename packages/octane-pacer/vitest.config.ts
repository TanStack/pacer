import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { octane } from 'octane/compiler/vite'
export default defineConfig({
  plugins: [octane({ ssr: false })],
  test: {
    name: '@tanstack/octane-pacer',
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    exclude: ['**/ssr/**'],
    watch: false,
    environment: 'happy-dom',
  },
})
