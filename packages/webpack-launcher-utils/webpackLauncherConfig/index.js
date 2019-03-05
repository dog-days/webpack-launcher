'use strict';
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const { webpackHotDevClientsObj } = require('./const');

const defaultConfig = require('./defaultWebpackLauncherConfig');

function checkConfig(config) {
  const { webpackHotDevClient } = config;
  function checkString(checkTarget) {
    if (!_.isString(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a string.`);
    }
  }
  function checkNumber(checkTarget) {
    if (!_.isNumber(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a number.`);
    }
  }
  function checkPlainObject(checkTarget) {
    if (!_.isPlainObject(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a plain object.`);
    }
  }
  function checkBoolean(checkTarget) {
    if (!_.isBoolean(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a boolean.`);
    }
  }
  checkString('servedPath');
  checkString('appSrc');
  checkString('appIndexJs');
  checkString('appBuild');
  checkString('appPublic');
  checkString('appHtml');
  checkString('host');
  checkNumber('port');
  checkPlainObject('proxy');
  checkPlainObject('alias');
  checkPlainObject('globals');
  checkBoolean('sourceMap');
  checkBoolean('https');
  checkBoolean('buildGzip');

  if (config.dllEntry !== undefined) {
    checkPlainObject('dllEntry');
    for (const key in config.dllEntry) {
      if (!Array.isArray(config.dllEntry[key])) {
        throw new TypeError('Expected the dllEntry[key] to be an array.');
      }
    }
  }

  if (config.tar !== undefined) {
    checkString('tar');
  }

  checkString('appDllBuild');

  if (config.splitChunks !== undefined) {
    checkPlainObject('splitChunks');
  }

  checkBoolean('runtimeChunk');

  const webpackHotDevClients = Object.values(webpackHotDevClientsObj);
  if (!~webpackHotDevClients.indexOf(webpackHotDevClient)) {
    throw new Error(
      `Expected the webpackHotDevClient to be one of the values: ${webpackHotDevClients}`
    );
  }
}

const customConfigAbsolutePath = path.resolve('.webpack.launcher.js');
let customConfig = {};
if (fs.existsSync(customConfigAbsolutePath)) {
  // 可动态修改 proxy 配置等
  delete require.cache[customConfigAbsolutePath];
  customConfig = require(customConfigAbsolutePath);
}
const lastConfig = Object.assign({}, defaultConfig, customConfig);

checkConfig(lastConfig);

lastConfig.appSrc = path.resolve(lastConfig.appSrc);
lastConfig.appIndexJs = path.resolve(lastConfig.appIndexJs);
lastConfig.appBuild = path.resolve(lastConfig.appBuild);
lastConfig.appDllBuild = path.resolve(lastConfig.appDllBuild);
lastConfig.appPublic = path.resolve(lastConfig.appPublic);
lastConfig.appHtml = path.resolve(lastConfig.appHtml);

// 保证为 /xxx/xx/ 格式
lastConfig.servedPath =
  '/' +
  lastConfig.servedPath
    .split('/')
    .filter(Boolean)
    .join('/');

module.exports = lastConfig;
