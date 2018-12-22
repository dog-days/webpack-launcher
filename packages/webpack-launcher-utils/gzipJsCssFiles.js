'use strict';

const fs = require('fs');
const chalk = require('chalk');
const zlib = require('zlib');
const path = require('path');

function canReadAsset(asset) {
  return /\.(js|css)$/.test(asset);
}
// function getFileNameByPath(filePath) {
//   // 首先转换为 url "/" 路径模式，兼容 windows
//   filePath = filePath.replace(/\\/g, '/');
//   const match = filePath.match(/[^\\]*\/(.*)/);
//   if (match) {
//     return match[1];
//   }
// }
function gzipJsCssFiles(webpackStats, buildFolder) {
  const filesArray = (webpackStats.stats || [webpackStats]).map(stats =>
    stats
      .toJson({ all: false, assets: true })
      .assets.filter(asset => canReadAsset(asset.name))
      .map(asset => {
        const filePath = path.resolve(buildFolder, asset.name);
        return filePath;
      })
  );
  filesArray.forEach(files => {
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const fileContents = fs.readFileSync(file);
        const gzipFileContent = zlib.gzipSync(fileContents);
        fs.writeFileSync(file, gzipFileContent);
      } else {
        console.log(chalk.red(`Some thing is wrong, the built file ${file} is not exits.`));
        process.exit(1);
      }
    });
  });
}
module.exports = gzipJsCssFiles;
