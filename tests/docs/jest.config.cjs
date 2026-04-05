module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/coverage/"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!node_modules/**",
    "!coverage/**"
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  clearMocks: true,
  passWithNoTests: true,
  rootDir: "../",
  testTimeout: 10000,
  moduleDirectories: ["node_modules", "docs/node_modules"],
};
