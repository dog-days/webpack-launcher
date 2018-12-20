'use strict';

// 这里可配置一些常用的配置，如果满足不了，需要 eject
// 相对路径为，npm 项目根目录
module.exports = {
  // 因为有些网站访问web app不是在根目录，可能是根目录中的的文件夹，basename是用来设置这种情况的
  // 例如`/demo`，访问网站根目录demo文件中的web app
  servedPath: '/',
  appSrc: './src',
  appIndexJs: './src/index.js',
  appBuild: './build',
  appPublic: './public',
  appHtml: './public/index.html',
  // https://webpack.docschina.org/configuration/dev-server/#devserver-host
  host: 'localhost',
  // https://webpack.docschina.org/configuration/dev-server/#devserver-port
  port: 8888,
  // https://webpack.docschina.org/configuration/dev-server/#devserver-proxy
  proxy: {},
  https: false,
  // 设置 webpack alias
  // https://webpack.docschina.org/configuration/resolve/#resolve-alias
  alias: {},
  // 设置 process.env.NODE_ENV 等全局变量
  // 格式 webpack.DefinePlugin 一样。
  // https://webpack.docschina.org/plugins/define-plugin/
  globals: {},
  // 是否开启 sourceMap 包括 less,postcss,js 等 sourceMap
  sourceMap: true,
  // webpack 热替换 client，有两种选择：
  // default: webpack默认的热替换热替换方式
  // create-react-app: craate-react-app 热替换方式
  webpackHotDevClient: 'create-react-app',
};
