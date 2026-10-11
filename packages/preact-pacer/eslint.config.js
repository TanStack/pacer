// @ts-check

import pluginReactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import rootConfig from '../../eslint.config.js'

export default defineConfig([
  ...rootConfig,
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
])
