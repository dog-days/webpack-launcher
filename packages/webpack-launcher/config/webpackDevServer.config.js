// 大部分采用 create-react-app 配置
'use strict';

const createMockMiddleware = require('restful-mock-middleware');
const createProxyMiddleware = require('webpack-dev-server-proxy-middlware');

const webpackConfig = require('./webpack.config');
const webpackLauncherConfig = require('../config/webpackLauncher.config');
const { host, proxy, https, appPublic } = webpackLauncherConfig;

module.exports = {
  // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html。通过传入以下启用：
  historyApiFallback: Object.assign({
    // 当路径中使用点(dot)，你可能需要使用 disableDotRule
    // 如 http://localhost/babel.config，就包含 (.)
    disableDotRule: true,
  }),
  // 设置为 true 时，此选项绕过主机检查。
  // 不检查主机的应用程序时，容易受到 DNS 重新连接攻击。
  // 默认开启
  disableHostCheck: true,
  // 开启gzip功能
  compress: true,
  // 关闭WebpackDevServer繁琐的输出信息
  // 但警告和错误信息不会被关闭
  clientLogLevel: 'none',
  // 告诉服务器从哪个目录中提供内容。只有在你想要提供静态文件时才需要。
  // devServer.publicPath 将用于确定应该从哪里提供 bundle，并且此选项优先。
  contentBase: appPublic,
  // 告知服务器，观察 devServer.contentBase 下的文件。文件修改后，会触发一次完整的页面重载。
  watchContentBase: true,
  // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层。
  // 使用 create-react-app wwebpackHotDevClient 时，
  // 这个覆盖成会被替换成 create-react-app 自定义的
  overlay: true,
  //开启热替换功能
  hot: true,
  //跟 webpack.config 中 publicPath 相等，bundle.js 等内存文件输出目录
  publicPath: webpackConfig.output.publicPath,
  // 会关闭WebpackDevServer编译后所有的信息（包括错误警告信息）
  // 后续通过 compiler.plugin('done',null) 自定义信息
  quiet: true,
  // watch设置
  watchOptions: {
    ignored: [/node_modules/],
  },
  // 默认情况下，dev-server 通过 HTTP 提供服务。也可以选择带有 HTTPS 的 HTTP/2 提供服务：
  https,
  host: host || 'localhost',
  // 禁止使用 webpack-dev-server
  // 使用独立的 proxy（从 webpack-dev-server 中抽离的）
  // 用法不变
  proxy: undefined,
  /**
   * 在服务内部的所有其他中间件之前， 提供执行自定义中间件的功能。
   */
  before(app, server) {
    // mock 优先级更高
    app.use(createMockMiddleware());
    app.use(createProxyMiddleware(proxy, server));
  },
};
