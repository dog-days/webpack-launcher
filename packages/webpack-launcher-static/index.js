#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const _ = require('lodash');
// Single Page Applications (SPA)
const historyApiFallback = require('connect-history-api-fallback');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const createMockMiddleware = require('restful-mock-middleware');
const createProxyMiddleware = require('webpack-dev-server-proxy-middlware');

const customConfigAbsolutePath = path.resolve('.webpack.launcher.js');
const deafultWebpackLauncherConfig = {
  host: 'localhost',
  port: 5000,
  appBuild: './build',
  proxy: undefined,
};
let customConfig = {};
if (fs.existsSync(customConfigAbsolutePath)) {
  customConfig = require(customConfigAbsolutePath);
}
const webpackLauncherConfig = Object.assign(deafultWebpackLauncherConfig, customConfig);

function runServer(host, port) {
  const app = express();
  // 为了在 createMockMiddleware 中使用
  const server = http.createServer(app);
  const root = path.resolve(webpackLauncherConfig.appBuild);
  // 需要用在 historyApiFallback 之前
  // 默认优先级高于 proxy
  app.use(createMockMiddleware());
  if (deafultWebpackLauncherConfig.proxy) {
    app.use(createProxyMiddleware(deafultWebpackLauncherConfig.proxy, server));
  }
  // single page
  // 需要用在 express.static 前面
  app.use(historyApiFallback());
  app.use(express.static(root));
  server.listen(port, host, function() {
    const localUrlForTerminal = `http://${host}:${port}`;
    openBrowser(localUrlForTerminal);
    console.log(`You can now view the app in the browser.`);
    console.log();
    console.log(`  ${localUrlForTerminal}`);
  });
}
module.exports = function(port = webpackLauncherConfig.port) {
  // 只处理 localhost 上的端口
  choosePort('localhost', port)
    .then(port => {
      runServer('localhost', port);
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
};
