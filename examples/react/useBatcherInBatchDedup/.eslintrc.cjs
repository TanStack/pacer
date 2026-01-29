// @ts-check

/** @type {import('eslint').Linter.Config} */
const config = {
  settings: {
    extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
    rules: {
      'react/no-children-prop': 'off',
    },
  },
}

module.exports = config
