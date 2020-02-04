module.exports = {
  env: {
    es: {
      presets: [
        [
          '@babel/env', {
            modules: false,
          },
        ],
        '@babel/preset-react',
      ],
    },

    cjs: {
      presets: [
        '@babel/env',
        '@babel/preset-react',
      ],
    },

    test: {
      presets: [
        '@babel/env',
        '@babel/preset-react',
      ],
    },
  },

  plugins: [
    // https://github.com/babel/babel/issues/10261
    ['@babel/plugin-transform-runtime', {
      version: require('@babel/helpers/package.json').version,
    }],
    '@babel/plugin-proposal-class-properties',
  ],
};
