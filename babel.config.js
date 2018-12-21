module.exports = {
  env: {
    es: {
      presets: [
        [
          '@babel/env', {
            modules: false,
          },
        ],
      ],
    },

    cjs: {
      presets: [
        '@babel/env',
      ],
    },

    test: {
      presets: [
        '@babel/env',
      ],
    },
  },

  plugins: [
    '@babel/plugin-transform-runtime',
  ],
};
