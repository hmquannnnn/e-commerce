import js from '@eslint/js';
import json from '@eslint/json';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tsParser from '@typescript-eslint/parser';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next/core-web-vitals';

export default defineConfig([
	...next,
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		ignores: [
			'node_modules/**/*',
			'dist/**/*',
			'build/**/*',
			'.react-router/**/*',
			'coverage/**/*',
		],
		settings: {
			react: {
				version: 'detect',
			},
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
					project: './tsconfig.json',
				},
			},
		},
		plugins: {
			js,
			sonarjs,
			'react-hooks': pluginReactHooks,
			react: pluginReact,
			prettier: pluginPrettier,
			'@tanstack/query': pluginQuery,
		},
		rules: {
			...sonarjs.configs.recommended.rules,
			...tseslint.configs.recommended.rules,
			...pluginReact.configs.recommended.rules,
			...pluginReactHooks.configs.recommended.rules,
			...pluginQuery.configs.recommended.rules,
			// sonarjs rules override
			'sonarjs/todo-tag': 'warn',
			'sonarjs/no-unused-collection': 'warn',
			'sonarjs/redundant-type-aliases': 'warn',
			'sonarjs/no-nested-conditional': 'warn',
			'sonarjs/no-nested-functions': 'warn',
			'sonarjs/no-commented-code': 'off',
			// react rules override
			'react/prop-types': 'off',
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			// ts rules override
			'no-unused-vars': ['warn'],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			// common rules override
			// Enforce tabs (size 2) via Prettier integration and disallow mixing
			'prettier/prettier': ['error', { useTabs: true, tabWidth: 2 }],
			'no-mixed-spaces-and-tabs': 'error',
			'no-console': ['error', { allow: ['warn', 'error'] }],
			semi: ['error', 'always'],
		},
	},
	{
		files: ['src/i18n/translations/**/*.json'],
		plugins: { json, prettier: pluginPrettier },
		language: 'json/json',
		rules: {
			...json.configs.recommended.rules,
			'json/sort-keys': 'error',
			// Also enforce tabs for JSON via Prettier
			'prettier/prettier': ['error', { useTabs: true, tabWidth: 2 }],
		},
	},
]);
