'use strict';

const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 11'],
        },
        // 测试环境需要把 import转换成 commonjs require 模式
        modules: NODE_ENV === 'test' || NODE_ENV === 'TEST' ? 'commonjs' : false,
        // 为了避免一些问题，使用 false
        loose: false,
      },
    ],
  ],
  plugins: [
    // Currently, @babel/preset-env is unaware that using import()
    // with Webpack relies on Promise internally.
    // Environments which do not have builtin support for Promise,
    // like Internet Explorer, will require both the promise and
    // iterator polyfills be added manually.
    '@babel/plugin-syntax-dynamic-import',
    // 这个是 es7 提案，并不是标准，用法如下
    // 这里使用 legacy (stage 1) decorators 语法和行为。
    // @decorator
    // class Test {}
    // 当 legacy = true 时，需要用在 `@babel/plugin-proposal-class-properties`
    // 之前，否则无效
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // 使用 class properties 新用法
    // class Test {
    //   displayName = 'test';
    // }
    '@babel/plugin-proposal-class-properties',
    // 需要配套安装 @babel/runtime
    // 其中 helper 功能可以减少转换生成的代码（通过引用 @bable/runtime）
    '@babel/plugin-transform-runtime',
  ],
};
