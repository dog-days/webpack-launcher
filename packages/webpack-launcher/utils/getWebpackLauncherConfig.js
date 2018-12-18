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
      // eslint-disable-next-line
      process.exit(1);
    }
  }
  function checkNumber(checkTarget) {
    if (!_.isNumber(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a number.`);
      // eslint-disable-next-line
      process.exit(1);
    }
  }
  function checkPlainObject(checkTarget) {
    if (!_.isPlainObject(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a plain object.`);
      // eslint-disable-next-line
      process.exit(1);
    }
  }
  function checkBoolean(checkTarget) {
    if (!_.isBoolean(config[checkTarget])) {
      throw new TypeError(`Expected the ${checkTarget} to be a boolean.`);
      // eslint-disable-next-line
      process.exit(1);
    }
  }
  checkString('servedPath');
  checkString('appSrc');
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
  customConfig = require(customConfigAbsolutePath);
}
const lastConfig = Object.assign({}, defaultConfig, customConfig);

checkConfig(lastConfig);

lastConfig.appSrc = path.resolve(lastConfig.appSrc);
lastConfig.appBuild = path.resolve(lastConfig.appBuild);
lastConfig.appPublic = path.resolve(lastConfig.appPublic);
lastConfig.appHtml = path.resolve(lastConfig.appHtml);

if (!fs.existsSync(lastConfig.appPublic) && !customConfig.appPublic) {
  // 没自定义 appPublic，且 appPublic 路径不存在，即使用者项目根目录找不到 appPublic 目录
  // 那么使用默认的 appPublic 路径
  lastConfig.appPublic = path.resolve(__dirname, './../template/public');
}
if (!fs.existsSync(lastConfig.appHtml) && !customConfig.appHtml) {
  // 没自定义 appHtml，且 appHtml 路径不存在，即使用者项目根目录找不到 appHtml 文件
  // 那么使用默认的 appHtml 路径
  lastConfig.appHtml = path.resolve(__dirname, './../template/public/index.html');
}
// 保证为 /xxx/xx/ 格式
lastConfig.servedPath =
  '/' +
  lastConfig.servedPath
    .split('/')
    .filter(Boolean)
    .join('/');

module.exports = lastConfig;
