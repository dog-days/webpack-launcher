// 大部分采用 create-react-app 配置
'use strict';

const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');

const webpackLauncherConfig = require('../config/webpackLauncher.config');

const shouldUseSourceMap = webpackLauncherConfig.sourceMap;

// webpack配置项
const config = {
  mode: 'production',
  // 在第一个错误出现时抛出失败结果，而不是容忍它。默认情况下，当使用 HMR 时，
  // webpack 会将在终端以及浏览器控制台中，以红色文字记录这些错误，但仍然继续进行打包。
  bail: true,
  devtool: shouldUseSourceMap ? 'source-map' : false,
  performance: {
    //隐藏终端的 warning 信息
    hints: false,
    maxEntrypointSize: 1100000,
    maxAssetSize: 505000,
  },
  entry: webpackLauncherConfig.dllEntry,
  output: {
    filename: 'dll.[name].[chunkhash:8].js',
    // dll 全局变量名定义
    library: 'dll_[name]_[chunkhash:8]',
    // 打包输出目录，只对生成环境有效
    path: webpackLauncherConfig.appDllBuild,
    // publicPath: '/',
    // 替换 Windows 系统路径为 URL 模式（ \ 替换为 /）,windows 也能识别这种路径，
    // 所以可以这样兼容 Windows 系统。
    devtoolModuleFilenameTemplate: info =>
      path.relative(webpackLauncherConfig.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  optimization: {
    minimize: true,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: shouldUseSourceMap,
      }),
    ],
  },
  module: {
    // makes missing exports an error instead of warning
    strictExportPresence: true,
  },
  resolve: {
    // 这样路径就不会解析到真实路径上
    symlinks: false,
    alias: Object.assign({}, webpackLauncherConfig.alias),
    // 不可留空字符串
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.web.js', '.web.jsx'],
  },
  plugins: [
    // 定义全局变量 process.env.NODE_ENV，可用于生产和开发环境的判断
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new SimpleProgressPlugin({
      progressOptions: {
        complete: chalk.bgGreen(' '),
        incomplete: chalk.bgWhite(' '),
        width: 20,
        total: 100,
        clear: true,
      },
    }),
    new webpack.DllPlugin({
      path: path.resolve(webpackLauncherConfig.appDllBuild, '[name]-manifest.json'),
      name: 'dll_[name]_[chunkhash:8]',
    }),
    // 需要过滤掉无效的配置
  ].filter(Boolean),
};
module.exports = config;
