#!/usr/bin/env node
'use strict';

const path = require('path');
const commander = require('commander');

const runServer = require('../index');

const projectPackageJson = require(path.resolve(__dirname, '../package.json'));

commander.version(projectPackageJson.version).parse(process.argv);

runServer();
