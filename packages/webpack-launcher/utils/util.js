'use strict';
const path = require('path');
const semver = require('semver');
const chalk = require('chalk');

module.exports = {
  /**
   * 获取当前输入目前package.json对象
   * @return {Object} package.js配置的json对象
   */
  getCwdPackageJson() {
    return require(path.resolve(process.cwd(), 'package.json'));
  },
  // /**
  //  * package.json 是否安装了指定的依赖包
  //  * @param {String} dependencyName
  //  * @return {Boolean} true or false
  //  */
  // hasSpecificDependency(dependencyName, packageJson) {
  //   return !!(
  //     (packageJson.dependencies && packageJson.dependencies[dependencyName]) ||
  //     (packageJson.devDependencies && packageJson.devDependencies[dependencyName])
  //   );
  // },
  /**
   * 检测输入node版本是否大于等于跟当前运行的版本
   * 如果不是将提示并退出程序
   * @param { String } version eg. v6.0.0
   */
  checkNodeVersion(version) {
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
      process.exit(1);
    }
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
