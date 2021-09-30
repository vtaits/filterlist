module.exports = {
  testPathIgnorePatterns: [
    '/node_modules/',
  ],

  transform: {
    '\\.[jt]sx?$': ['babel-jest', {
      rootMode: 'upward',
    }],
  },
};
