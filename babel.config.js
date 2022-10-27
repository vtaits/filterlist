module.exports = {
  env: {
    es: {
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
    },

    cjs: {
      presets: [
        '@babel/preset-typescript',
        '@babel/env',

        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
      ],
    },

    test: {
      presets: [
        '@babel/preset-typescript',

        [
          '@babel/env',
          {
            targets: {
              chrome: '105',
              firefox: '105',
            },
          },
        ],

        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
      ],
    },
  },

  plugins: [
    // https://github.com/babel/babel/issues/10261
    ['@babel/plugin-transform-runtime', {
      version: '7.19.6',
    }],
    '@babel/plugin-proposal-class-properties',
  ],
};
