import { extensions, ember } from '@embroider/vite'
import { babel } from '@rollup/plugin-babel'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ember(),
    babel({
      babelHelpers: 'inline',
      extensions,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        tests: 'tests/index.html',
      },
    },
  },
})
