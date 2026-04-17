/**
 * @type {import("@types/eslint").Linter.BaseConfig}
 */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    'plugin:hydrogen/recommended',
    'plugin:hydrogen/typescript',
    'plugin:import/recommended',
  ],
  settings: {
    jest: {
      version: 29,
    },
  },
  rules: {
    'prettier/prettier': 'off',
    'import/first': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'hydrogen/prefer-image-component': 'off',
    'no-useless-escape': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    'no-case-declarations': 'off',
    'no-console': ['warn', {allow: ['warn', 'error']}],
    'import/order': ['warn', {alphabetize: {order: 'asc'}}],
    'no-unused-vars': 'warn',
  },
};
