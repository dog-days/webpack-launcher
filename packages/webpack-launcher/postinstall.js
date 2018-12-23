const fs = require('fs-extra');
const path = require('path');

// 如果上一个目录是 node_modules，则执行命令
//（被第三方安装，只考虑默认的 node_modules 情况，自定义的 npm 安装文件夹不考虑）
const nodeModulewebpackLauncherPackageJson = path.resolve(
  __dirname,
  '../../node_modules/webpack-launcher/package.json'
);
if (fs.existsSync(nodeModulewebpackLauncherPackageJson)) {
  const copyedPublicFolder = path.resolve('public');
  fs.ensureDirSync(copyedPublicFolder);
  fs.copySync(path.resolve(__dirname, './template/public'), copyedPublicFolder);
  // node_modules 上一级文件夹下的 package.json
  const pacakgeJsonPath = path.resolve(__dirname, '../../package.json');
  const pacakgeJson = require(pacakgeJsonPath);
  pacakgeJson.scripts.eject = 'webpack-launcher eject';
  pacakgeJson.scripts.start = 'webpack-launcher start';
  pacakgeJson.scripts.build = 'webpack-launcher build';
  pacakgeJson.scripts['serve-build'] = 'webpack-launcher serve-build';
  fs.writeFileSync(pacakgeJsonPath, JSON.stringify(pacakgeJson, null, 2));
}
