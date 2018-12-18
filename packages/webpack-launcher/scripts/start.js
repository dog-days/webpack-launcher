// 参考 create-react-app start
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/scripts/start.js
'use strict';
console.log('Starting service...');

process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');

const webpackConfig = require('../config/webpack.config');
const webpackLauncherConfig = require('../utils/getWebpackLauncherConfig');
const webpackDevServerConfig = require('../config/webpackDevServer.config');
const { printInstructions } = require('../utils/util');
const createWebpackCompiler = require('../utils/createWebpackCompiler');

const { host, port: defaultPort } = webpackLauncherConfig;

// 实际上，在 Node 中执行的进程我们可以通过 process.stdout.isTTY 这个属性来判断它是否在终端（terminal）终端环境中执行。
// 在后台执行，是不支持 chalk 终端颜色输出等。（使用 & npm run start ）
const isInteractive = process.stdout.isTTY;

function runDevServer(port) {
  const compiler = createWebpackCompiler(webpack, webpackConfig, function(isFirstCompile) {
    const localUrlForTerminal = `http://${host}:${port}`;
    if (isFirstCompile) {
      openBrowser(localUrlForTerminal);
    }
    if (isFirstCompile || isInteractive) {
      printInstructions({ localUrlForTerminal });
    }
  });
  const devServer = new WebpackDevServer(compiler, webpackDevServerConfig);
  // 启动 WebpackDevServer.
  devServer.listen(port, err => {
    if (err) {
      return console.log(err);
    }
  });
}

choosePort(host, defaultPort)
  .then(port => {
    runDevServer(port);
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
