import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  {
    files: ['**/*.astro'],
    rules: {
      // Astro components may have unused vars in frontmatter that are used in template
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/env.d.ts'],
    rules: {
      // Astro requires triple-slash reference for types
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  },
);
