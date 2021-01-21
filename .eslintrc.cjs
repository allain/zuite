// eslint-disable-next-line no-undef
module.exports = {
  env: {
    commonjs: true,
    node: true,
    browser: true,
    es6: true,
    jest: true
  },
  root: true,
  plugins: ['security'],
  ignorePatterns: ['dist'],
  extends: ['eslint:recommended', 'plugin:security/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  }
}
