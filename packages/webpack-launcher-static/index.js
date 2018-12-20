#!/usr/bin/env node
'use strict';
// 检测 node 版本
require('webpack-launcher-utils/checkNodeVersion')();

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 脚本未知原因终止运行，需要提示错误
process.on('unhandledRejection', err => {
  // 解绑本地域名
  removeLocalHost(webpackLauncherConfig.host, function() {
    throw err;
  });
});

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const spdy = require('spdy');
const del = require('del');
const semver = require('semver');
const createCertificate = require('webpack-dev-server/lib/utils/createCertificate');
const setLocalHost = require('webpack-launcher-utils/setLocalHost');
const removeLocalHost = require('webpack-launcher-utils/removeLocalHost');
const createSigntSigtermProcessEvent = require('webpack-launcher-utils/createSigntSigtermProcessEvent');
// Single Page Applications (SPA)
const historyApiFallback = require('connect-history-api-fallback');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const createMockMiddleware = require('restful-mock-middleware');
const createProxyMiddleware = require('webpack-dev-server-proxy-middlware');
const webpackLauncherConfig = require('webpack-launcher-utils/webpackLauncherConfig');

/**
 * 创建 http 或者 https server（直接使用 webpack-dev-server 代码）
 * @param {Object} app express app 实例
 * @param {Object} options
 * @param {Boolean} options.https 是否使用 https
 */
function createServer(app, options = {}) {
  let server;
  if (options.https) {
    // for keep supporting CLI parameters
    if (typeof options.https === 'boolean') {
      options.https = {
        ca: options.ca,
        pfx: options.pfx,
        key: options.key,
        cert: options.cert,
        passphrase: options.pfxPassphrase,
        requestCert: options.requestCert || false,
      };
    }

    let fakeCert;

    if (!options.https.key || !options.https.cert) {
      // Use a self-signed certificate if no certificate was configured.
      // Cycle certs every 24 hours
      const certPath = path.join(__dirname, './ssl/server.pem');

      let certExists = fs.existsSync(certPath);

      if (certExists) {
        const certTtl = 1000 * 60 * 60 * 24;
        const certStat = fs.statSync(certPath);

        const now = new Date();

        // cert is more than 30 days old, kill it with fire
        if ((now - certStat.ctime) / certTtl > 30) {
          del.sync([certPath], { force: true });

          certExists = false;
        }
      }

      if (!certExists) {
        const attrs = [{ name: 'commonName', value: 'localhost' }];

        const pems = createCertificate(attrs);

        fs.writeFileSync(certPath, pems.private + pems.cert, { encoding: 'utf-8' });
      }

      fakeCert = fs.readFileSync(certPath);
    }

    options.https.key = options.https.key || fakeCert;
    options.https.cert = options.https.cert || fakeCert;

    if (!options.https.spdy) {
      options.https.spdy = {
        protocols: ['h2', 'http/1.1'],
      };
    }

    // `spdy` is effectively unmaintained, and as a consequence of an
    // implementation that extensively relies on Node’s non-public APIs, broken
    // on Node 10 and above. In those cases, only https will be used for now.
    // Once express supports Node's built-in HTTP/2 support, migrating over to
    // that should be the best way to go.
    // The relevant issues are:
    // - https://github.com/nodejs/node/issues/21665
    // - https://github.com/webpack/webpack-dev-server/issues/1449
    // - https://github.com/expressjs/express/issues/3388
    if (semver.gte(process.version, '10.0.0')) {
      server = https.createServer(options.https, app);
    } else {
      server = spdy.createServer(options.https, app);
    }
  } else {
    server = http.createServer(app);
  }
  return server;
}

function runServer(options) {
  let { host, port, proxy, appBuild, https: isHttps, servedPath } = options;
  const app = express();
  // 为了在 createMockMiddleware 中使用
  const server = createServer(app, { https: isHttps });
  const root = path.resolve(appBuild);
  // 需要用在 historyApiFallback 之前
  // 默认优先级高于 proxy
  app.use(createMockMiddleware());
  if (proxy) {
    app.use(createProxyMiddleware(proxy, server));
  }
  // single page
  // 需要用在 express.static 前面
  app.use(historyApiFallback());
  app.use(express.static(root));
  server.listen(port, function() {
    function openBrowserAntPrintInstructions(host, port, isHttps) {
      const protocol = isHttps ? 'https' : 'http';
      const localUrlForTerminal = `${protocol}://${host}:${port}${servedPath}`;
      openBrowser(localUrlForTerminal);
      console.log(`You can now view the app in the browser.`);
      console.log();
      console.log(`  ${localUrlForTerminal}`);
    }
    setLocalHost(host, function(err) {
      if (err) {
        // 如果报错，直接使用默认的 localhost
        host = 'localhost';
      }
      openBrowserAntPrintInstructions(host, port, isHttps);
    });
  });
  createSigntSigtermProcessEvent(function() {
    // ctr + c 退出等
    removeLocalHost(host, function() {
      server.close();
      process.exit();
    });
  });
}
module.exports = function(options) {
  // 默认端口 5000
  options = { ...webpackLauncherConfig, port: 5000, ...options };
  // 只处理 localhost 上的端口
  choosePort('localhost', options.port)
    .then(port => {
      runServer({ ...options, port });
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
};
