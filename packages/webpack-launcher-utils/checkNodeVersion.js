'use strict';

const chalk = require('chalk');
const semver = require('semver');

/**
 * 检测输入node版本是否大于等于跟当前运行的版本
 * 如果不是将提示并退出程序
 * @param { String } version eg. v8.0.0
 */
function checkNodeVersion(version = 'v8.0.0') {
  if (!semver.satisfies(process.version, '>=' + version)) {
    console.error(
      chalk.red(
        'You are running Node %s.\n' +
          'It requires Node %s or higher. \n' +
          'Please update your version of Node.'
      ),
      process.version,
      version
    );
    process.exit();
  }
}
module.exports = checkNodeVersion;
