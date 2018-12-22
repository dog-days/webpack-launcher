// 大部分源自，create-react-app start
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/scripts/build.js

'use strict';
// 检测 node 版本
require('webpack-launcher-utils/checkNodeVersion')();

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 脚本未知原因终止运行，需要提示错误
process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const bfj = require('bfj');
const tar = require('tar');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');
const gzipJsCssFiles = require('webpack-launcher-utils/gzipJsCssFiles');

const webpackConfig = require('../config/webpack.config');
const webpackLauncherConfig = require('../config/webpackLauncher.config');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

// 这些文件非常大的话，我们会抛出警告。
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// 如果入口 js 文件和入口 html 文件不存在，退出并报错
if (!checkRequiredFiles([webpackLauncherConfig.appHtml, webpackLauncherConfig.appIndexJs])) {
  process.exit(1);
}

// Process CLI arguments
// npm run build -- --stats 会存储 webpack stats json 信息
// 到 ${webpackLauncherConfig.appBuild}/bundle-stats.json 中
const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf('--stats') !== -1;

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(webpackLauncherConfig.appBuild)
  .then(previousFileSizes => {
    // 首先清空 build 文件夹
    fs.emptyDirSync(webpackLauncherConfig.appBuild);
    // 复制 public 相关静态文件到 build 文件
    copyPublicFolder();
    // 开始 webpack build 服务
    return build(previousFileSizes);
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' + chalk.cyan('// eslint-disable-next-line') + ' to the line before.\n'
        );
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }

      console.log('File sizes after gzip:\n');
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        webpackLauncherConfig.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );
      console.log();
      if (webpackLauncherConfig.buildGzip) {
        // 如果开启打包文件 gzip 功能，打包后端 css 和 js 文件内容都是经过 gzip 后的内容
        // 需要 gzip 解压后才可以访问
        console.log('Creating the gzip files...');
        gzipJsCssFiles(stats, webpackLauncherConfig.appBuild);
        console.log(chalk.green('Complete the gizp files creation.'));
      }
      console.log();
      if (webpackLauncherConfig.tar) {
        function getTarFileName() {
          const { name, version } = require(path.resolve('package.json'));
          return webpackLauncherConfig.tar
            .replace(/\{version\}/g, version)
            .replace(/\{name\}/g, name);
        }
        const fileName = getTarFileName();
        const filePath = path.resolve(fileName);
        const shouldGzip = !!~webpackLauncherConfig.tar.match(/.*\.([^.]+)/)[1].indexOf('gz');

        console.log(`Creating the ${fileName} file...`);

        if (fs.existsSync(filePath)) {
          // 先删除存在的 tar 文件
          fs.removeSync(filePath);
        }
        tar
          .c(
            {
              gzip: shouldGzip,
              file: filePath,
            },
            [path.relative('./', webpackLauncherConfig.appBuild)]
          )
          .then(_ => {
            console.log(chalk.green(`Complete the ${fileName} file creation.`));
          })
          .catch(err => {
            console.log(chalk.red(err));
          });
      }

      // const appPackage = require(paths.appPackageJson);
      // const publicUrl = paths.publicUrl;
      // const publicPath = config.output.publicPath;
      // const buildFolder = path.relative(process.cwd(), paths.appBuild);
      // printHostingInstructions(appPackage, publicUrl, publicPath, buildFolder, false);
    },
    err => {
      console.log(chalk.red('Failed to compile.\n'));
      printBuildError(err);
      process.exit(1);
    }
  )
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Creating an optimized production build...');

  const compiler = webpack(webpackConfig);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }
        messages = formatWebpackMessages({
          errors: [err.message],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }

      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      };
      if (writeStatsJson) {
        return bfj
          .write(webpackLauncherConfig.appBuild + '/bundle-stats.json', stats.toJson())
          .then(() => resolve(resolveArgs))
          .catch(error => reject(new Error(error)));
      }

      return resolve(resolveArgs);
    });
  });
}

function copyPublicFolder() {
  fs.copySync(webpackLauncherConfig.appPublic, webpackLauncherConfig.appBuild, {
    dereference: true,
    filter: file => file !== webpackLauncherConfig.appHtml,
  });
}
