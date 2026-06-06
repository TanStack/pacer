// @ts-check

import rootConfig from '../../eslint.config.js'
import { fileURLToPath } from 'node:url'

const tsconfigRootDir = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...rootConfig,
  {
    name: 'angular-pacer/typescript-projects',
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.lib.json', './tsconfig.spec.json'],
        tsconfigRootDir,
      },
    },
  },
]
