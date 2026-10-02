import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  test: {
    name: packageJson.name,
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    watch: false,
    environment: 'happy-dom',
    globals: true,
  },
})
