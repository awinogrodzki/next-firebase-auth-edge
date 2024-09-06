import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: [
      "**/*.ts",
      "**/*.tsx"
    ],
    ignores: [
      "node_modules",
      "lib"
    ],
    rules: {
      'prettier/prettier': 'error',
    },
  }
);
