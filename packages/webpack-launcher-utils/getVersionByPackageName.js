const fs = require('fs');
const chalk = require('chalk');

/**
 * 根据包名获取 node_modules 中包版本
 * @return { String } packageName npm 包名，可以是 xxx、xxx/xxx/xxx、@xxx/xxxx、@xxx/xxx/xxx
 * @return { String } version
 */
module.exports = function getVersionByPackageName(packageName) {
  let packageJsonPath;
  const packageNameSplit = packageName.split('/');

  if (!!~packageName.indexOf('@') && packageNameSplit.length > 2) {
    // pacakgeName 为 @xxx/xxx/xxx 需要取出 @xxx/xxx 真正的包名
    const [groupFolderName, packageFolderName] = packageNameSplit;

    packageJsonPath = require.resolve(`${groupFolderName}/${packageFolderName}/package.json`);
  } else if (packageNameSplit.length > 1) {
    const [packageFolderName] = packageNameSplit;

    packageJsonPath = require.resolve(`${packageFolderName}/package.json`);
  } else {
    packageJsonPath = require.resolve(`${packageName}/package.json`);
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      chalk.red(
        `The package ${packageName} is not found in the pacakge.json. Run ${chalk.cyan(
          `npm install ${packageName} --save`
        )} to install.`
      )
    );
    process.exit(1);
  }

  const version = require(packageJsonPath).version;

  return version;
};
