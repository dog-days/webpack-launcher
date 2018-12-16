module.exports = {
  extends: 'react-app',
  parserOptions: {
    ecmaFeatures: {
      // 允许 decorator 语法
      legacyDecorators: true,
    },
  },
  rules: {
    'jsx-a11y/href-no-hash': 'off',
    strict: 'off',
  },
};
