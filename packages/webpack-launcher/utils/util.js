'use strict';
const path = require('path');
const chalk = require('chalk');

module.exports = {
  /**
   * 获取当前输入目前package.json对象
   * @return {Object} package.js配置的json对象
   */
  getCwdPackageJson() {
    return require(path.resolve(process.cwd(), 'package.json'));
  },
  printInstructions({ localUrlForTerminal }) {
    console.log();
    console.log(`You can now view the app in the browser.`);
    console.log();

    console.log(`  ${localUrlForTerminal}`);

    console.log();
    console.log('Note that the development build is not optimized.');
    console.log(`To create a production build, use ${chalk.cyan('npm run build')}.`);
    console.log();
  },
};
