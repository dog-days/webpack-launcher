#!/usr/bin/env node
'use strict';

// 因为 webpackLauncher.config 需要用到，所以要放在最前面
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

const { appDllBuild, dllEntry } = require('../config/webpackLauncher.config');
const { shouldBuildDll } = require('webpack-launcher-utils/dllEntryUtils');

if (shouldBuildDll(dllEntry, appDllBuild)) {
  const buildDll = require('../scripts/buildDll.js');

  buildDll(() => {
    console.log();
    console.log('The cutting line ---------------------------------------------');
    console.log();
    require('../scripts/start.js');
  });
} else {
  require('../scripts/start.js');
}
