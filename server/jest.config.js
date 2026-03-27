export default {
  testEnvironment: "node",

  testMatch: ["**/tests/**/*.test.[jt]s?(x)"],
  transform: {},
  moduleFileExtensions: ["js", "json", "node"],
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  clearMocks: true,
  testTimeout: 15000,
  roots: ["<rootDir>"],
  testPathIgnorePatterns: ["/node_modules/"],
};
