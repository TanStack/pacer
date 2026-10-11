// @ts-check

import { defineConfig } from 'eslint/config'
import rootConfig from '../../eslint.config.js'

const config = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx,vue}'],
  },
])

export default config
