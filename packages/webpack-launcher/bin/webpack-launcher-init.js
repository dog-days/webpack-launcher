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
    const copyedPublicFolder = path.resolve('public');
    if (fs.existsSync(copyedPublicFolder)) {
      console.log(chalk.red('The public folder is exits, initialzation is abort.'));
      process.exit();
    }
    fs.ensureDirSync(copyedPublicFolder);
    console.log();
    console.log('  Adding ./public folder.');
    fs.copySync(path.resolve(__dirname, '../template/public'), copyedPublicFolder);

    const pacakgeJsonPath = path.resolve('package.json');
    const pacakgeJson = require(pacakgeJsonPath);
    console.log('  Deleting `npm run init-webpack-launcher`');
    delete pacakgeJson.scripts['init-webpack-launcher'];
    if (pacakgeJson.scripts.eject) {
      console.log('  Rewriting `npm run eject` as webpack-launcher eject');
    } else {
      console.log('  Adding `npm run eject` as webpack-launcher eject');
    }
    pacakgeJson.scripts.eject = 'webpack-launcher eject';

    if (pacakgeJson.scripts.start) {
      console.log('  Rewriting `npm run start` as webpack-launcher start');
    } else {
      console.log('  Adding `npm run start` as webpack-launcher start');
    }
    pacakgeJson.scripts.start = 'webpack-launcher start';

    if (pacakgeJson.scripts.build) {
      console.log('  Rewriting `npm run build` as webpack-launcher build');
    } else {
      console.log('  Adding `npm run build` as webpack-launcher build');
    }
    pacakgeJson.scripts.build = 'webpack-launcher build';

    if (pacakgeJson.scripts['serve-build']) {
      console.log('  Rewriting `npm run serve-build` as webpack-launcher serve-build');
    } else {
      console.log('  Adding `npm run serve-build` as webpack-launcher serve-build');
    }
    pacakgeJson.scripts['serve-build'] = 'webpack-launcher serve-build';

    fs.writeFileSync(pacakgeJsonPath, JSON.stringify(pacakgeJson, null, 2));
    console.log();
    console.log(chalk.green('Initialized successfully.'));
  });
