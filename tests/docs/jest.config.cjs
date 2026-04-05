module.exports = {
  testEnvironment: "node",
  coverageProvider: "v8",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/coverage/"],
  modulePathIgnorePatterns: ["<rootDir>/web/.next/"],
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
  rootDir: "../../",
  testTimeout: 10000,
  moduleDirectories: ["node_modules", "<rootDir>/tests/docs/node_modules"],
};
