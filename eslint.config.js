// @ts-check

// @ts-ignore Needed due to moduleResolution Node vs Bundler
import { tanstackConfig } from '@tanstack/eslint-config'
import unusedImports from 'eslint-plugin-unused-imports'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...tanstackConfig,
  {
    files: ['tests/e2e/**/*.ts', 'examples/*/*/tests/e2e/**/*.{ts,mts}'],
    languageOptions: {
      parserOptions: { project: './tests/e2e/tsconfig.json' },
    },
  },
  {
    name: 'tanstack/temp',
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-case-declarations': 'off',
      'no-shadow': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'pnpm/enforce-catalog': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
]

export default config
