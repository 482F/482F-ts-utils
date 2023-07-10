import Config482F from 'eslint-config-482f-config'
import TypescriptParser from '@typescript-eslint/parser'
export default [
  {
    ignores: ['**/eslint.config.js'],
  },
  ...Config482F,
  {
    languageOptions: {
      parser: TypescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
  },
]
