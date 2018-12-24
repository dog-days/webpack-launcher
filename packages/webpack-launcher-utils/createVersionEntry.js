'use strict';

// version 入口文件，设置 window.__version__ 为当用户项目的 package.json version
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');

let versionPath = path.resolve(__dirname, '.projectVersionEntry.js');

module.exports = function() {
  let { name, version, description, repository } = require(path.resolve('package.json'));

  if (typeof repository === 'object') {
    repository = repository.url;
  }

  if (!version) {
    console.error(chalk.red('The package verion in package.json is required.'));
    process.exit();
  }

  const dateString = moment().format('YYYY-MM-DD HH:mm:ss');
  const versionInfo = {
    appName: name,
    version,
    description,
    repository,
  };
  // eslint-disable-next-line
  const versionDescription = description
    ? `\\r\\n${description}`
    : '' +
      `\\r\\nThe webp app is created at ${dateString}.` +
      `\\r\\nThe app name is ${name}.` +
      `\\r\\nThe version is ${version}.` +
      `\\r\\nThe repository is ${repository ? repository : 'not defined'}.` +
      '\\r\\n';
  let versionEntryContents = '// The file is created automatically,please do not rewrite it.\r\n';
  versionEntryContents += 'if(window){';
  versionEntryContents += `window.__version__='v${version}(${dateString})';`;
  versionEntryContents += `window.__versionInfo__=${JSON.stringify(versionInfo)};`;
  versionEntryContents += `window.__versionDescription__='${versionDescription}';`;
  versionEntryContents += '}';

  try {
    fs.writeFileSync(versionPath, versionEntryContents);
  } catch {
    console.log(
      chalk.yellow(
        'The version.js is created failed.You can not use window.__version__ to check the version.'
      )
    );
    // 在 webpack entry 中，需要过滤掉空路径
    versionPath = '';
  }
  return versionPath;
};
