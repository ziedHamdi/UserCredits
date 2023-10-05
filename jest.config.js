export default {
  globalSetup: "<rootDir>/config/jest/globalSetup.js",

  // Other Jest configuration options...
  preset: "ts-jest",
  // Specify your global setup file
  setupFilesAfterEnv: ["<rootDir>/config/jest/setupBeforeAll.js"],
  testEnvironment: "node",
  transform: {},
};
