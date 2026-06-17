import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  vue: true,
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  ignores: [
    'dist',
    'node_modules',
    'docs',
    'src/auto-imports.d.ts',
    'src/components.d.ts',
    '.eslintrc-auto-import.json',
    'vite.config.d.ts',
    'vite.config.js',
  ],
  rules: {
    'no-console': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
})
