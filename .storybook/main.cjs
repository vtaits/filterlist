module.exports = {
  stories: ['../packages/**/*.stories.tsx'],

  framework: '@storybook/react',

  addons: [
    '@storybook/preset-create-react-app',
  ],

  core: {
    builder: '@storybook/builder-vite',
  },

  features: {
    storyStoreV7: true,
  },
};
