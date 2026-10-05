// @ts-check

import rootConfig from '../../eslint.config.js'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx,vue}'],
  },
]

export default config
