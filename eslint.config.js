import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    rules: {
      // Custom overrides if needed
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
];
