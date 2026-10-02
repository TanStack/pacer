import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // Linked devtools packages must use the same React instance as the app.
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react()],
})
