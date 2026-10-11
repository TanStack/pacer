// @ts-check

import { defineConfig } from 'eslint/config'
import rootConfig from '../../eslint.config.js'

export default defineConfig([
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
  },
  {
    plugins: {},
    rules: {},
  },
  {
    files: ['**/__tests__/**'],
    rules: {},
  },
])
