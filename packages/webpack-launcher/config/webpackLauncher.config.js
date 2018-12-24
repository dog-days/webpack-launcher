'use strict';
const path = require('path');
const fs = require('fs');
const webpackLauncherConfig = require('webpack-launcher-utils/webpackLauncherConfig');

// @remove-on-eject-begin
if (!webpackLauncherConfig.appPublic || !fs.existsSync(webpackLauncherConfig.appPublic)) {
  // 无 appPublic，且 appPublic 路径不存在，即使用者项目根目录找不到 appPublic 目录
  // 那么使用默认的 appPublic 路径
  webpackLauncherConfig.appPublic = path.resolve(__dirname, './../template/public');
}
if (!webpackLauncherConfig.appHtml || !fs.existsSync(webpackLauncherConfig.appHtml)) {
  // 无 appHtml 或者 且 appHtml 路径不存在，即使用者项目根目录找不到 appHtml 文件
  // 那么使用默认的 appHtml 路径
  webpackLauncherConfig.appHtml = path.resolve(__dirname, './../template/public/index.html');
}
// @remove-on-eject-end
module.exports = webpackLauncherConfig;
