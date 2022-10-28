export default {
  testPathIgnorePatterns: [
    '/node_modules/',
  ],

  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  transform: {
    '\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
