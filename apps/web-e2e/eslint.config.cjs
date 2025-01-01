const baseConfig = require('../../eslint.config.cjs');
const path = require('path');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.json'),
      },
    },
  },
];
