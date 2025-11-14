import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import love from 'eslint-config-love'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier/recommended'
import solid from 'eslint-plugin-solid/configs/recommended'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  solid,
  globalIgnores(['node_modules/', 'static/', 'exampleSite/', '*.mjs', 'bundled/']),
  {
    ...love,
    ...prettier,

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json'
      }
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    },

    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'import/no-cycle': 'error',

      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: true,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true
        }
      ],

      'import/no-unresolved': 'error',

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'unknown'
          ],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
    }
  }
])
