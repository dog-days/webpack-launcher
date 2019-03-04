const path = require('path');
const chalk = require('chalk');

/**
 * 根据包名获取 node_modules 中包版本
 * @return { String } version
 */
module.exports = function getVersionByPackageName(packageName) {
  const cwdPackageJson = require(path.resolve('package.json'));
  const allDependencies = { ...cwdPackageJson.dependencies, ...cwdPackageJson.devDependencies };
  const version = allDependencies[packageName];

  if (!version) {
    console.error(
      chalk.red(
        `The package ${packageName} is not found in the pacakge.json. Run ${chalk.cyan(
          `npm install ${packageName} --save`
        )} to install.`
      )
    );
    process.exit(1);
  }

  return version;
};
