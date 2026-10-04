import { defineConfig } from 'vite'
import { octane } from 'octane/compiler/vite'

export default defineConfig({
  plugins: [octane()],
  optimizeDeps: {
    exclude: ['@tanstack/pacer'],
    // Discover the host and core dependencies before lazy panels mount. A late
    // optimizer pass would invalidate chunks already requested by the host.
    include: [
      '@tanstack/devtools',
      '@tanstack/pacer-devtools',
      '@tanstack/octane-pacer > @tanstack/pacer > @tanstack/store',
      '@tanstack/octane-pacer > @tanstack/pacer > @tanstack/devtools-event-client',
    ],
  },
})
