import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact({
      // Exclude all @tanstack packages from Fast Refresh processing
      // This prevents duplicate Fast Refresh declarations when libraries
      // already include Fast Refresh code from their builds
      exclude: [/node_modules\/@tanstack/, /packages\/.*-pacer/],
    }),
  ],
})
