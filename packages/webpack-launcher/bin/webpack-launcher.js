#!/usr/bin/env node
'use strict';

const path = require('path');
const commander = require('commander');
const util = require('../utils/util');

//检测node版本
util.checkNodeVersion('v6.0.0');

const projectPackageJson = path.resolve(__dirname, '../package.json');

commander
  .version(projectPackageJson.version)
  .command('start', 'Start the dev server.')
  .command('build', 'Production building.')
  // .command('serve-build', 'Serve the static files in the build folder.')
  .parse(process.argv);
