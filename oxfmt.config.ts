import { tanstackConfig } from '@tanstack/oxfmt-config'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...tanstackConfig,
  svelte: true,
  associations: [
    {
      files: ['examples/angular/*/src/app/**/*.html'],
      language: 'angular-html',
    },
  ],
  ignorePatterns: [
    ...tanstackConfig.ignorePatterns,
    '**/.angular',
    '**/.nx',
    '**/docs',
    '**/dist-tests',
    '**/old-examples',
    '**/playwright-report',
    '**/test-results',
  ],
})
