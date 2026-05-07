// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const next = require('@next/eslint-plugin-next');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '*.min.js',
      '*.min.css',
      'coverage/**',
      '.DS_Store',
      'eslint.config.js',
      '.qoder/**',
      '.qoder-new/**',
      'tool/**',
      'package/**',
      'package 2/**',
      'docs/**',
      'test_data/**',
      'world.ts',
      'app/monopoly/**',
      'app/whack-a-mole/page.tsx',
      'app/aircraft-battle/page.tsx',
      'lib/components/__tests__/**',
    ],
  },

  // Base JavaScript config
  eslint.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // React config
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@next/next': next,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...next.configs.recommended.rules,
      
      // Custom rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^React$',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Allow require for CommonJS configs
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
      // Game development often requires patterns that violate strict hooks rules
      // These are acceptable when using refs for game state management
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },

  // Prettier config (must be last)
  prettier,
];
