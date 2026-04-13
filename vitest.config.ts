import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: false,
    exclude: [...configDefaults.exclude, 'dist/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage/vitest',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 65,
        functions: 50,
      },
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'scripts/',
        '**/*.d.ts',
        '**/*types.ts',
        '**/index.ts',
        '*.config.ts',
        '*.config.js',
        '*.config.mjs',
        '*.config.cjs'
      ]
    }
  }
})
