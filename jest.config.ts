/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
};

process.env = Object.assign(process.env, {
  GITHUB_TOKEN: "gh-token",
});
