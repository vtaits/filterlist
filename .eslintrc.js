module.exports = {
  env: {
    browser: true,
    'jest/globals': true,
    es6: true,
  },

  extends: [
    'eslint:recommended',
    'airbnb-typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  plugins: [
    'react',
    'jest',
    '@typescript-eslint',
  ],

  parserOptions: {
    project: './tsconfig.validate.json',
  },

  settings: {
    'import/resolver': {
      typescript: {},
    },
  },

  rules: {
    'arrow-parens': ['error', 'always'],
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-nested-ternary': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': [
          '**/setup-jest.js',
          '**/__tests__/**',
          '**/__stories__/**'
        ],

        'peerDependencies': true,
      },
    ],

    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    'react/jsx-props-no-spreading': 'off',

    '@typescript-eslint/no-explicit-any': 'off',

    'react/static-property-placement': 'off',

    'react/prop-types': 'off',
  }
};
