import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './packages/bouncer/vite.config.ts',
  './packages/react-bouncer/vite.config.ts',
])
