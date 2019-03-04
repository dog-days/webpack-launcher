#!/usr/bin/env node
'use strict';

const { appDllBuild, dllEntry } = require('../config/webpackLauncher.config');
const { shouldBuildDll } = require('webpack-launcher-utils/dllEntryUtils');

if (shouldBuildDll(dllEntry, appDllBuild)) {
  const buildDll = require('../scripts/buildDll.js');

  buildDll(() => {
    console.log();
    console.log('The cutting line ---------------------------------------------');
    console.log();
    require('../scripts/build');
  });
} else {
  require('../scripts/build');
}
