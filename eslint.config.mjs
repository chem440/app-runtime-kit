import tsParser from '@typescript-eslint/parser'

const config = [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**']
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off'
    }
  }
]

export default config
