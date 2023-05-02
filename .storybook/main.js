module.exports = {
  stories: ['../packages/**/*.stories.tsx'],

  core: {
    builder: 'webpack5',
  },

  webpackFinal: (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: [
          '@babel/preset-typescript',

          [
            '@babel/env', {
              modules: false,
            },
          ],

          [
            '@babel/preset-react',
            {
              runtime: 'automatic',
            },
          ],
        ],

        plugins: [
          // https://github.com/babel/babel/issues/10261
          ['@babel/plugin-transform-runtime', {
            version: '7.19.6',
          }],
          '@babel/plugin-proposal-class-properties',
        ],
      },
    });

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },
};
