'use strict';
// 检测 node 版本
require('webpack-launcher-utils/checkNodeVersion')();

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 脚本未知原因终止运行，需要提示错误
process.on('unhandledRejection', err => {
  throw err;
});

const inquirer = require('react-dev-utils/inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

inquirer
  .prompt({
    type: 'confirm',
    name: 'shouldEject',
    message: 'Are you sure you want to eject? This action is permanent.',
    default: false,
  })
  .then(answer => {
    if (!answer.shouldEject) {
      console.log(chalk.cyan('Close one! Eject aborted.'));
      return;
    }

    const shouldCopyedfileRelativePaths = [
      './.eslintrc.js',
      './.babelrc.js',
      './config/webpack.config.js',
      './config/webpackDevServer.config.js',
      './config/webpackLauncher.config.js',
      './scripts/start.js',
      './scripts/build.js',
      './scripts/serve-build.js',
      './public/index.html',
      './public/favicon.ico',
    ];
    shouldCopyedfileRelativePaths.forEach(relativeFilePath => {
      // 检查文件是否存储，只要其中存在立即中断 eject
      const file = path.resolve(relativeFilePath);
      if (fs.existsSync(file)) {
        console.log();
        console.log(chalk.red(`The ejected file ${relativeFilePath} exited! Eject aborted.`));
        console.log();
        console.log(chalk.cyan('Make sure that the file not existed in any of the following:'));
        console.log();
        shouldCopyedfileRelativePaths.forEach(relativeFilePath => {
          console.log(`  ${relativeFilePath}`);
        });
        process.exit();
      }
    });
    console.log();
    console.log('Ejecting...');
    console.log();

    const copyedPublicFolder = path.resolve('public');
    fs.ensureDirSync(copyedPublicFolder);
    fs.copySync(path.resolve(__dirname, '../template/public'), copyedPublicFolder);

    shouldCopyedfileRelativePaths.forEach(relativeFilePath => {
      if (!!~relativeFilePath.indexOf('./public/')) {
        // public 直接复制
        console.log(`  Adding ${chalk.cyan(relativeFilePath)}`);
        return;
      }
      // 原始文件路径
      let originalFilePath = path.resolve(__dirname, '../', relativeFilePath);
      // 复制后的路径
      const copyedFilePath = path.resolve(relativeFilePath);
      if (relativeFilePath === './.eslintrc.js') {
        originalFilePath = path.resolve(__dirname, '../config/eslint.config.js');
      } else if (relativeFilePath === './.babelrc.js') {
        originalFilePath = path.resolve(__dirname, '../config/babel.config.js');
      }
      let content = fs.readFileSync(originalFilePath, 'utf8');
      content = content
        // Remove dead code from .js files on eject
        .replace(/\/\/ @remove-on-eject-begin([\s\S]*?)\/\/ @remove-on-eject-end/gm, '')
        .trim();
      console.log(`  Adding ${chalk.cyan(relativeFilePath)}`);
      fs.outputFileSync(copyedFilePath, content);
    });

    updateCwdPackageJson();

    console.log();
    console.log('Ejected sucessfully!');
  });

function updateCwdPackageJson() {
  const cwdPacakgeJsonPath = path.resolve('package.json');
  const cwdPacakgeJson = require(cwdPacakgeJsonPath);
  cwdPacakgeJson.scripts.start = 'node ./scripts/start.js';
  cwdPacakgeJson.scripts.build = 'node ./scripts/build.js';
  cwdPacakgeJson.scripts['serve-build'] = 'node ./scripts/serve-build.js';
  delete cwdPacakgeJson.scripts.eject;
  fs.outputFileSync(cwdPacakgeJsonPath, JSON.stringify(cwdPacakgeJson, null, 2));
}
