module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: "standard",
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "accessor-pairs": [1, { enforceForClassMembers: false }],
    quotes: ["error", "double", { avoidEscape: true }]
  }
}
