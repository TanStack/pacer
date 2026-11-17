import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // Linked devtools packages must use the same React instance as the app.
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react()],
})
