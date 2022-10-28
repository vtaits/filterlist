const jestConfig = {
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

export default jestConfig;
