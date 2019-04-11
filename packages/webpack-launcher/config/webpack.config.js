// 大部分采用 create-react-app 配置
'use strict';

const path = require('path');
const chalk = require('chalk');
const safePostCssParser = require('postcss-safe-parser');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const webpack = require('webpack');

const PnpWebpackPlugin = require('pnp-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { webpackHotDevClientsObj } = require('webpack-launcher-utils/webpackLauncherConfig/const');
const createVersionEntry = require('webpack-launcher-utils/createVersionEntry');
const { createDllScripts } = require('webpack-launcher-utils/dllEntryUtils');

const webpackLauncherConfig = require('../config/webpackLauncher.config');

// 不是生成环境就当做开发环境
const isEnvProduction = process.env.NODE_ENV === 'production';
const shouldUseSourceMap = webpackLauncherConfig.sourceMap;

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

// 该选项的值是以 runtime(运行时) 或 loader(载入时) 所创建的每个 URL 为前缀。
// 因此，在多数情况下，此选项的值都会以 / 结束。
// 因为有些网站访问web app不是在根目录，可能是根目录中的的文件夹，servedPath 是用来设置这种情况的
// 例如`/demo`，访问网站根目录demo文件中的web app
// publicPath: 'https://cdn.example.com/assets/', // CDN（总是 HTTPS 协议）
// publicPath: '//cdn.example.com/assets/', // CDN（协议相同）
// publicPath: '/assets/', // 相对于 web 服务根目录(server-relative)
// publicPath: 'assets/', // 相对于 HTML 页面
// publicPath: '../assets/', // 相对于 HTML 页面
// publicPath: '', // 相对于 HTML 页面（目录相同）
const publicPath = isEnvProduction ? `${webpackLauncherConfig.servedPath}` : '/';
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// PUBLIC_URL 比 publicPath 少最右边一个 ’/‘
// 如 /test/ => /test
const PUBLIC_URL = isEnvProduction ? publicPath.slice(0, -1) : '';
// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor, preProcessorOptions) => {
  const loaders = [
    !isEnvProduction && require.resolve('style-loader'),
    isEnvProduction && {
      loader: MiniCssExtractPlugin.loader,
      options: Object.assign(
        {},
        shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
      ),
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebook/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
        ],
        sourceMap: isEnvProduction && shouldUseSourceMap,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    let requiredPreProcessor;
    try {
      requiredPreProcessor = require.resolve(preProcessor);
    } catch (e) {
      // noop
    }
    if (requiredPreProcessor) {
      // sass,less 等
      loaders.push({
        loader: requiredPreProcessor,
        options: {
          sourceMap: isEnvProduction && shouldUseSourceMap,
          ...preProcessorOptions,
        },
      });
    }
  }
  return loaders;
};

// 入口文件处理
const defaultHotEntry = [
  // 热替换入口文件
  // 必须 + '?/'，否则 websocket 访问路径会有问题
  require.resolve('webpack-dev-server/client') + '?/',
  // bundle the client for hot reloading
  // only- means to only hot reload for successful updates
  require.resolve('webpack/hot/only-dev-server'),
];
const createReactAppHotEntry = [require.resolve('react-dev-utils/webpackHotDevClient')];

const entry = [
  createVersionEntry(),
  // app 入口文件要放在其他入口文件之后
  webpackLauncherConfig.appIndexJs,
  //过滤无效的入口，如空字符、null、undefined 等
].filter(Boolean);

if (!isEnvProduction) {
  if (webpackLauncherConfig.webpackHotDevClient === webpackHotDevClientsObj['create-react-app']) {
    Array.prototype.unshift.apply(entry, createReactAppHotEntry);
  } else if (webpackLauncherConfig.webpackHotDevClient === webpackHotDevClientsObj.default) {
    Array.prototype.unshift.apply(entry, defaultHotEntry);
  }
}

function getDevtoolSetting() {
  if (isEnvProduction) {
    return shouldUseSourceMap ? 'source-map' : false;
  } else {
    return 'cheap-module-source-map';
  }
}
//webpack配置项
const config = {
  mode: isEnvProduction ? 'production' : 'development',
  // 在第一个错误出现时抛出失败结果，而不是容忍它。默认情况下，当使用 HMR 时，
  // webpack 会将在终端以及浏览器控制台中，以红色文字记录这些错误，但仍然继续进行打包。
  bail: isEnvProduction,
  devtool: getDevtoolSetting(),
  performance: {
    //隐藏终端的 warning 信息
    hints: false,
    maxEntrypointSize: 1100000,
    maxAssetSize: 505000,
  },
  entry,
  output: {
    filename: isEnvProduction ? 'static/js/[name].[chunkhash:8].js' : 'static/js/bundle.js',
    // 打包输出目录，只对生成环境有效
    path: webpackLauncherConfig.appBuild,
    // 告知 webpack 在 bundle 中引入「所包含模块信息」的相关注释。
    // 此选项在 development 模式时的默认值是 true，而在 production 模式时的默认值是 false。
    pathinfo: !isEnvProduction,
    publicPath,
    // webpeck import 异步载入模块，文件命名配置。（code splitting）
    // https://webpack.docschina.org/guides/code-splitting/
    chunkFilename: isEnvProduction
      ? 'static/js/[name].[chunkhash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    // 替换 Windows 系统路径为 URL 模式（ \ 替换为 /）,windows 也能识别这种路径，
    // 所以可以这样兼容 Windows 系统。
    devtoolModuleFilenameTemplate: isEnvProduction
      ? info =>
          path.relative(webpackLauncherConfig.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
      : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  optimization: {
    minimize: isEnvProduction,
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
      // This is only used in production mode
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          parser: safePostCssParser,
          map: shouldUseSourceMap
            ? {
                // `inline: false` forces the sourcemap to be output into a
                // separate file
                inline: false,
                // `annotation: true` appends the sourceMappingURL to the end of
                // the css file, helping the browser find the sourcemap
                annotation: true,
              }
            : false,
        },
      }),
    ],
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    splitChunks: webpackLauncherConfig.splitChunks,
    // Keep the runtime chunk seperated to enable long term caching
    // https://twitter.com/wSokra/status/969679223278505985
    runtimeChunk: webpackLauncherConfig.runtimeChunk,
  },
  module: {
    // makes missing exports an error instead of warning
    strictExportPresence: true,
    rules: [
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      // 需要再 babel 转换前执行
      {
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: require.resolve('react-dev-utils/eslintFormatter'),
              eslintPath: require.resolve('eslint'),
              // @remove-on-eject-begin
              // 默认的 eslint 配置
              // .eslintrc.* 优先级更高，配置会被 merge
              baseConfig: require('./eslint.config.js'),
              // @remove-on-eject-end
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: webpackLauncherConfig.appSrc,
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          // url-loader 专门处理指定类型图片文件，file-loader 处理非指定类型图片文件
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // Process application JS with Babel.
          // The preset includes JSX, Flow, and some ESnext features.
          {
            test: /\.(js|mjs|jsx)$/,
            include: webpackLauncherConfig.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              // @remove-on-eject-begin
              configFile: path.resolve(__dirname, './babel.config.js'),
              // @remove-on-eject-end
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
              cacheCompression: isEnvProduction,
              compact: isEnvProduction,
            },
          },
          // "postcss" loader applies autoprefixer to our CSS.
          // "css" loader resolves paths in CSS and adds assets as dependencies.
          // "style" loader turns CSS into JS modules that inject <style> tags.
          // In production, we use MiniCSSExtractPlugin to extract that CSS
          // to a file, but in development "style" loader enables hot editing
          // of CSS.
          // By default we support CSS Modules with the extension .module.css
          {
            test: cssRegex,
            exclude: cssModuleRegex,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: isEnvProduction && shouldUseSourceMap,
            }),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },
          // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
          // using the extension .module.css
          {
            test: cssModuleRegex,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: isEnvProduction && shouldUseSourceMap,
              modules: true,
              getLocalIdent: getCSSModuleLocalIdent,
            }),
          },
          // Opt-in support for SASS (using .scss or .sass extensions).
          {
            test: sassRegex,
            exclude: sassModuleRegex,
            use: getStyleLoaders(
              {
                importLoaders: 2,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              },
              'sass-loader'
            ),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },
          // Adds support for CSS Modules, but using SASS
          // using the extension .module.scss or .module.sass
          {
            test: sassModuleRegex,
            use: getStyleLoaders(
              {
                importLoaders: 2,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: true,
                getLocalIdent: getCSSModuleLocalIdent,
              },
              'sass-loader'
            ),
          },
          // Opt-in support for Less (using .less extensions).
          {
            test: lessRegex,
            exclude: lessModuleRegex,
            use: getStyleLoaders(
              {
                importLoaders: 2,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              },
              'less-loader',
              {
                javascriptEnabled: true,
              }
            ),
            // Don't consider CSS imports dead code even if the
            // containing package claims to have no side effects.
            // Remove this when webpack adds a warning or an error for this.
            // See https://github.com/webpack/webpack/issues/6571
            sideEffects: true,
          },
          // Adds support for CSS Modules, but using SASS
          // using the extension .module.less
          {
            test: lessModuleRegex,
            use: getStyleLoaders(
              {
                importLoaders: 2,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: true,
                getLocalIdent: getCSSModuleLocalIdent,
              },
              'less-loader'
            ),
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: require.resolve('file-loader'),
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  resolve: {
    // 这样路径就不会解析到真实路径上
    symlinks: false,
    alias: Object.assign({}, webpackLauncherConfig.alias),
    //不可留空字符串
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.web.js', '.web.jsx'],
    plugins: [
      // Adds support for installing with Plug'n'Play, leading to faster installs and adding
      // guards against forgotten dependencies and such.
      PnpWebpackPlugin,
    ],
  },
  resolveLoader: {
    plugins: [
      // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
      // from the current package.
      PnpWebpackPlugin.moduleLoader(module),
    ],
  },
  plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          inject: true,
          template: webpackLauncherConfig.appHtml,
        },
        isEnvProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined
      )
    ),
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In production, it will be an empty string unless you specify "homepage"
    // in `package.json`, in which case it will be the pathname of that URL.
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
      PUBLIC_URL,
      ADDITIONALSCRIPTS: createDllScripts(webpackLauncherConfig),
    }),
    // 定义全局变量 process.env.servedPath，可用于 react-router 中的 basename
    // 定义全局变量 process.env.NODE_ENV，可用于生产和开发环境的判断
    new webpack.DefinePlugin(
      Object.assign(
        {
          'process.env.servedPath': JSON.stringify(webpackLauncherConfig.servedPath),
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        },
        webpackLauncherConfig.globals
      )
    ),
    // 开启热替换功能，开发环境需要开启
    !isEnvProduction && new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebook/create-react-app/issues/240
    // 开发环境需要注意路径大小写
    !isEnvProduction && new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebook/create-react-app/issues/186
    !isEnvProduction && new WatchMissingNodeModulesPlugin(path.resolve('node_modules')),
    isEnvProduction &&
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
    // prints more readable module names in the browser console on HMR updates
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: publicPath,
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

    // 需要过滤掉无效的配置
  ].filter(Boolean),
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};

// 处理 dllEntry 配置
if (webpackLauncherConfig.dllEntry) {
  for (const dllEntryName in webpackLauncherConfig.dllEntry) {
    config.plugins.push(
      new webpack.DllReferencePlugin({
        manifest: require(path.resolve(
          webpackLauncherConfig.appDllBuild,
          `${dllEntryName}-manifest.json`
        )),
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.web.js', '.web.jsx'],
      })
    );
  }
}

module.exports = config;
