import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    name: '@tanstack/vue-pacer-devtools',
    dir: fileURLToPath(new URL('./tests', import.meta.url)),
    watch: false,
    environment: 'happy-dom',
    globals: true,
  },
})
