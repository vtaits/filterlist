module.exports = {
  testPathIgnorePatterns: [
    '/node_modules/',
  ],

  setupFiles: [
    './setup-jest.js',
  ],

  transform: {
    '\\.[jt]sx?$': ['babel-jest', {
      rootMode: 'upward',
    }],
  },
};
