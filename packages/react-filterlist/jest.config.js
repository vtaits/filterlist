module.exports = {
  testPathIgnorePatterns: [
    '/node_modules/',
  ],

  setupFiles: [
    './setup-jest.cjs',
  ],

  transform: {
    '\\.[jt]sx?$': ['babel-jest', {
      rootMode: 'upward',
    }],
  },
};
