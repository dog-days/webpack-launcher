#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const _ = require('lodash');
// Single Page Applications (SPA)
const historyApiFallback = require('connect-history-api-fallback');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const createMockMiddleware = require('restful-mock-middleware');
const createProxyMiddleware = require('http-proxy-middleware');

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
// 转换成 webpack proxy 模式
function proxyWebpackFormat(proxy) {
  if (!_.isPlainObject) {
    throw new TypeError('Expected the proxy to be a plain object.');
  }
  const newProxy = {};
  for (let path in proxy) {
    if (_.isString(proxy[path])) {
      newProxy[path] = {
        target: proxy[path],
      };
    } else {
      newProxy[path] = proxy;
    }
  }
  return newProxy;
}
function runServer(host, port) {
  const app = express();
  const root = path.resolve(webpackLauncherConfig.appBuild);
  // 需要用在 historyApiFallback 之前
  // 默认优先级高于 proxy
  app.use(createMockMiddleware());
  if (deafultWebpackLauncherConfig.proxy) {
    const proxy = proxyWebpackFormat(deafultWebpackLauncherConfig.proxy);
    for (let path in proxy) {
      app.use(path, createProxyMiddleware(proxy[path]));
    }
  }
  // single page
  // 需要用在 express.static 前面
  app.use(historyApiFallback());
  app.use(express.static(root));
  app.listen(port, host, function() {
    const localUrlForTerminal = `http://${host}:${port}`;
    openBrowser(localUrlForTerminal);
    console.log(`You can now view the app in the browser.`);
    console.log();
    console.log(`  ${localUrlForTerminal}`);
  });
}
module.exports = function(host = webpackLauncherConfig.host, port = webpackLauncherConfig.port) {
  choosePort(host, port)
    .then(port => {
      runServer(host, port);
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
};
