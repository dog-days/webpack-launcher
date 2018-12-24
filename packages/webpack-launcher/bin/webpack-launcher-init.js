#!/usr/bin/env node
'use strict';

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('react-dev-utils/inquirer');

inquirer
  .prompt({
    type: 'confirm',
    name: 'shouldEject',
    message: `Are you sure you want to initialize webpack launcher? \r\nThe package scripts will be changed.`,
    default: false,
  })
  .then(answer => {
    if (!answer.shouldEject) {
      console.log(chalk.cyan('Close one! Initialization aborted.'));
      return;
    }
    // 处理 public 文件夹
    const copyedPublicFolder = path.resolve('public');
    if (fs.existsSync(copyedPublicFolder)) {
      console.log();
      console.log(chalk.red('The public folder is exited, initialzation is abort.'));
      process.exit();
    }
    fs.ensureDirSync(copyedPublicFolder);
    console.log();
    console.log(`  Adding ${chalk.cyan('./public')} folder.`);
    fs.copySync(path.resolve(__dirname, '../template/public'), copyedPublicFolder);

    // 处理 src 文件夹
    const copyedSrcFolder = path.resolve('src');
    if (fs.existsSync(copyedSrcFolder)) {
      console.log();
      console.log(chalk.yellow('  The src folder is exited, use the exited src folder instead.'));
      console.log(
        chalk.yellow(`  Please make sure the entry file ${chalk.cyan('./src/index.js')} is exited.`)
      );
      console.log();
    } else {
      fs.ensureDirSync(copyedSrcFolder);
      console.log(`  Adding ${chalk.cyan('./src')} folder.`);
      fs.copySync(path.resolve(__dirname, '../template/src'), copyedSrcFolder);
    }

    const pacakgeJsonPath = path.resolve('package.json');
    const pacakgeJson = require(pacakgeJsonPath);
    console.log(`  Deleting ${chalk.cyan('npm run init-webpack-launcher')}`);
    delete pacakgeJson.scripts['init-webpack-launcher'];
    if (pacakgeJson.scripts.eject) {
      console.log(`  Rewriting ${chalk.cyan('npm run eject')} as webpack-launcher eject`);
    } else {
      console.log(`  Adding ${chalk.cyan(`npm run eject`)} as webpack-launcher eject`);
    }
    pacakgeJson.scripts.eject = 'webpack-launcher eject';

    if (pacakgeJson.scripts.start) {
      console.log(`  Rewriting ${chalk.cyan(`npm run start`)} as webpack-launcher start`);
    } else {
      console.log(`  Adding ${chalk.cyan(`npm run start`)} as webpack-launcher start`);
    }
    pacakgeJson.scripts.start = 'webpack-launcher start';

    if (pacakgeJson.scripts.build) {
      console.log(`  Rewriting ${chalk.cyan(`npm run build`)} as webpack-launcher build`);
    } else {
      console.log(`  Adding ${chalk.cyan(`npm run build`)} as webpack-launcher build`);
    }
    pacakgeJson.scripts.build = 'webpack-launcher build';

    if (pacakgeJson.scripts['serve-build']) {
      console.log(
        `  Rewriting ${chalk.cyan(`npm run serve-build`)} as webpack-launcher serve-build`
      );
    } else {
      console.log(`  Adding ${chalk.cyan(`npm run serve-build`)} as webpack-launcher serve-build`);
    }
    pacakgeJson.scripts['serve-build'] = 'webpack-launcher serve-build';

    fs.writeFileSync(pacakgeJsonPath, JSON.stringify(pacakgeJson, null, 2));
    console.log();
    console.log(chalk.green('Initialized successfully.'));
  });
