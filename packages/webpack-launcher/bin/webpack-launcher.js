#!/usr/bin/env node
'use strict';

const path = require('path');
const commander = require('commander');

const projectPackageJson = require(path.resolve(__dirname, '../package.json'));

commander
  .version(projectPackageJson.version)
  .command('eject', 'Eject config and script files to the project.')
  .command('start', 'Start the dev server.')
  .command('build', 'Production building.')
  .command(
    'serve-build',
    'Serve the static files in the build folder with mock or proxy if exiting.'
  )
  .parse(process.argv);
