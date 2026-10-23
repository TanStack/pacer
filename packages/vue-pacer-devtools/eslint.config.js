// @ts-check

import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'
import rootConfig from '../../eslint.config.js'

export default defineConfig([
  ...rootConfig,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['src/VuePacerDevtools.tsx'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },
])
