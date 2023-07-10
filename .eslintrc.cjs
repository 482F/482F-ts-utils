export default {
  ignorePatterns: ['.eslintrc.cjs'],
  extends: ['482f-config'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
}
