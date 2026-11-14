import pluginReact from '@eslint-react/eslint-plugin'
import { tanstackConfig } from '@tanstack/oxlint-config'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'oxlint'
import type { DummyRuleMap, OxlintConfig } from 'oxlint'

/** `@eslint-react` recommended, minus the hooks rules Oxlint runs natively */
const eslintReactRules = Object.fromEntries(
  Object.entries(pluginReact.configs.recommended.rules ?? {}).filter(
    ([name]) =>
      name !== '@eslint-react/rules-of-hooks' &&
      name !== '@eslint-react/exhaustive-deps',
  ),
) as DummyRuleMap

/**
 * `eslint-plugin-vue` `flat/recommended`, aliased to `vue-js` because Oxlint
 * reserves the `vue` name for its native plugin
 */
const eslintVueRules = Object.fromEntries(
  pluginVue.configs['flat/recommended']
    .flatMap((entry) => Object.entries(entry.rules ?? {}))
    .map(([name, value]) => [name.replace(/^vue\//, 'vue-js/'), value]),
) as DummyRuleMap

const config: OxlintConfig = defineConfig({
  extends: [tanstackConfig],
  // Not inherited through `extends`
  env: tanstackConfig.env,
  ignorePatterns: [...tanstackConfig.ignorePatterns, '**/dist-tests/**'],
  rules: {
    'no-case-declarations': 'off',
    'no-shadow': 'off',
  },
  overrides: [
    {
      files: ['packages/react-pacer/**', 'packages/react-pacer-devtools/**'],
      plugins: ['react'],
      jsPlugins: [
        '@eslint-react/eslint-plugin',
        'eslint-plugin-react-compiler',
      ],
      rules: {
        ...eslintReactRules,
        'react-compiler/react-compiler': 'error',
        'react/rules-of-hooks': 'error',
        'react/exhaustive-deps': 'error',
      },
    },
    {
      files: ['packages/preact-pacer/**'],
      plugins: ['react'],
      rules: {
        'react/rules-of-hooks': 'error',
        'react/exhaustive-deps': 'error',
      },
    },
    {
      files: ['packages/vue-pacer/**', 'packages/vue-pacer-devtools/**'],
      jsPlugins: [{ name: 'vue-js', specifier: 'eslint-plugin-vue' }],
      rules: eslintVueRules,
    },
    {
      files: [
        'packages/vue-pacer/tests/**',
        'packages/vue-pacer-devtools/src/VuePacerDevtools.tsx',
      ],
      rules: {
        'vue-js/one-component-per-file': 'off',
      },
    },
  ],
})

export default config
