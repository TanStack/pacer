// @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [
    'prettier-plugin-svelte',
    'prettier-plugin-ember-template-tag',
    '@tsrx/prettier-plugin',
  ],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
}

export default config
