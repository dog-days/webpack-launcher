'use strict';

const hostile = require('hostile');
const chalk = require('chalk');

/**
 * 绑定本地域名，IP 写死为 127.0.0.1
 * localhost 除外
 * @param {String} host
 * @param {Function} callback 回调，无论成功与否，参数 err
 */
function setLocalHost(host, callback) {
  if (host !== 'localhost') {
    // 绑定本地域名
    hostile.set('127.0.0.1', host, function(err) {
      if (err) {
        console.log(
          chalk.yellow(`Something is The host ${host} is not added,use localhost instead.`)
        );
        console.log(chalk.yellow(err));
      }
      callback && callback(err);
    });
  } else {
    callback && callback();
  }
}
module.exports = setLocalHost;
