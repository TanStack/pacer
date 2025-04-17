import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './packages/pacer/vite.config.ts',
  './packages/react-pacer/vite.config.ts',
  './packages/solid-pacer/vite.config.ts',
])
