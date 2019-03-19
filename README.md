# Webpack Launcher

webpack 启动器，简化 webpack 繁杂配置，提供便捷的使用方式。

**目前此工具只在 mac 平台进行测试，后续会针对 windows 进行测试**。

## 安装和使用

### 安装

```sh
npm i webpack-launcher -D
```

### 简单使用

安装完毕后运行运行一下命令，即可运行样板代码。

```sh
npm run init-webpack-launcher
npm start
```

**注意**：

 `npm run init-webpack-launcher`（postinstall 会添加添加此命令，直接使用即可）。此命令的内容为：`webpack-launcher init`，运行此命令后可在终端看到如下信息：

```sh
Adding ./public folder.
Adding ./src folder.
Deleting npm run init-webpack-launcher
Adding npm run eject as webpack-launcher eject
Adding npm run start as webpack-launcher start
Adding npm run build as webpack-launcher build
Adding npm run serve-build as webpack-launcher serve-build
```

如果 public 文件夹存在，程序会直接中断。

如果 src 文件夹存在，直接使用已存在的 src 文件夹并警告：

```sh
Adding ./public folder.

The src folder is exited, use the exited src folder instead.
Please make sure the entry file ./src/index.js is exited.

Deleting npm run init-webpack-launcher
Rewriting npm run eject as webpack-launcher eject
Rewriting npm run start as webpack-launcher start
Rewriting npm run build as webpack-launcher build
Rewriting npm run serve-build as webpack-launcher serve-build
```

### 结合 React 使用

首先安装 `@babel/preset-react@7.x.x`

这里需要在项目根目录添加 `.babelrc.js` ：

```js
'use strict';

module.exports = {
  presets: [
    // 支持 react jsx
    ['@babel/react'],
  ]
};
```

然后在 src/index.js 入口文件添加 React 代码即可，其他无改动。

## webpack-launcher 配置文件

webpack-launcher 配置文件命名为 `.webpack.launcher.js`，直接在项目根目录新建文件即可，默认的配置为：

```js
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
  // proxy 优先级高于 mock
  proxy: {},
  // 默认使用使用 mock 服务
  // 不需要可以关闭 mock 服务
  useMockServer: true,
  // 是否开启 https
  https: false,
  // 设置 webpack alias
  // https://webpack.docschina.org/configuration/resolve/#resolve-alias
  alias: {},
  // 设置 process.env.NODE_ENV 等全局变量
  // 格式 webpack.DefinePlugin 一样。
  // https://webpack.docschina.org/plugins/define-plugin/
  globals: {},
  // 是否开启 sourceMap 包括 less、postcss、js 等 sourceMap,只对生产环境有效
  sourceMap: true,
  // webpackHotDevClient，有两种选择：
  // default: webpack 默认的热替换热替换方式(需要手动开启)
  // create-react-app: craate-react-app 热替换方式(默认开启这个)
  webpackHotDevClient: 'create-react-app',
  // 打包的 js、css 文件会被 gzip（后缀名还是 js 或者 css，但是内容已经 gzip）
  // 默认不开启
  buildGzip: false,
  // 是否压缩，压缩包命名例如 `{name}-frontend-v{version}.tar.gz`
  tar: undefined,
  // dll 建议配置
  dllEntry: undefined,
  appDllBuild: './public/dll',
  // Automatically split vendor and commons
  // https://twitter.com/wSokra/status/969633336732905474
  // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
  // webpack 配置 optimization.splitChunks
  // create-react-app 的默认值为：
  // {
  //   chunks: 'all',
  //   name: false,
  // },
  splitChunks: undefined,
  // Keep the runtime chunk seperated to enable long term caching
  // https://twitter.com/wSokra/status/969679223278505985
  // webpack 配置 optimization.runtimeChunk
  runtimeChunk: false,
};

```

**功能列表会逐一说明，说有配置都是可选的。**

## 功能列表

- 默认的 babel 配置

- HTTP API 模拟（mock）
- 反向代理
- 域名 host 绑定
- Https
- 别名（alias）
- 环境全局变量（如 process.env.NODE_ENV）
- 热替换
- webpack dll
- js、css 内容 gzip
- 构建 tar.gz 压缩包
- 构建后的 web 静态服务

### 默认 babel 配置

```js
'use strict';

const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          browsers: ['ie >= 11'],
        },
        // 测试环境需要把 import转换成 commonjs require 模式
        modules: NODE_ENV === 'test' || NODE_ENV === 'TEST' ? 'commonjs' : false,
        // 为了避免一些问题，使用 false
        loose: false,
      },
    ],
  ],
  plugins: [
    // Currently, @babel/preset-env is unaware that using import()
    // with Webpack relies on Promise internally.
    // Environments which do not have builtin support for Promise,
    // like Internet Explorer, will require both the promise and
    // iterator polyfills be added manually.
    '@babel/plugin-syntax-dynamic-import',
    // 这个是 es7 提案，并不是标准，用法如下
    // 这里使用 legacy (stage 1) decorators 语法和行为。
    // @decorator
    // class Test {}
    // 当 legacy = true 时，需要用在 `@babel/plugin-proposal-class-properties`
    // 之前，否则无效
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    // 使用 class properties 新用法
    // class Test {
    //   displayName = 'test';
    // }
    '@babel/plugin-proposal-class-properties',
    // 需要配套安装 @babel/runtime（dependencies，非 devDependencies）
    // 其中 helper 功能可以减少转换生成的代码（通过引用 @babel/runtime）
    '@babel/plugin-transform-runtime',
  ],
};
```

### HTTP API 模拟（mock）

这个功能在开发前期比较常用，可以保证和后端的同步开发。`webpack-launcher` mock 有以下优点：

- 容易上手

  express API 使用方式，如下：

  ```js
  module.exports = function(mockApp) {
    mockApp.get('/keeper/v1/topic', function(req, res) {
      res.send({ url: req.url, query: req.query });
    });
    
    mockApp.post('/keeper/v1/topic', function(req, res) {
      res.send({ url: req.url, query: req.query });
    });
    
    mockApp.patch('/keeper/v1/topic/:id', function(req, res) {
      res.send({
        url: req.url,
        query: req.query,
        body: req.body,
        'data|10': [{ 'id|+1': 1 }],
      });
    });
    
    mockApp.delete('/keeper/v1/topic/:id', function(req, res) {
      res.send({ url: req.url, query: req.query });
    });
  };
  ```

- 动态加载，服务启动后，修改 mock 文件后，无需重启服务，再次访问即可

- 直接支持 mock.js 语法

后续会继承一些更便捷的组合方式提供选用，使用者也可以基于 mock 用法进行开发新用法。

#### mock 使用

`webpack-launcher` 一切准备后之后，在项目根目录新建 `mock` 文件夹，并新建 `.mock.config.js` 文件。

`.mock.config.js` 是 mock 程序的唯一入口，结构为：

```js
module.exports = function(mockApp) {
  // 可以简单的把 mockApp 当做 express app
};
```

在 `.mock.config.js` 中编写好 mock 内容，然后 `npm start` 启动服务（中途修改 mock 内容无需重启）。

如果你要完全禁止这 mock 可以在 `.webpack.launcher.js` 进行如下配置：

```js
module.exports = {
  useMockServer: false,
}
```

### proxy（反向代理）

这个用法跟 webpack-dev-server proxy 配置一样，请参考 [webpack 文档](https://www.webpackjs.com/configuration/dev-server/#devserverproxy)。

### 域名 host 绑定

使用此项功能可以在 `.webpack.launcher.js` 进行如下配置，默认值为 localhost：

```js
module.exports = {
  host: 'webpack.launcher.com',
}
```

启动服务后，会自动更新 host 到系统 hosts 文件。

### 使用 Https

 是否使用 https 协议启动服务，默认不开启，用法请看 [webpack-dev-server 文档](https://www.webpackjs.com/configuration/dev-server/#devserver-https)，这里`.webpack.launcher.js` 配置简化为：

```js
module.exports = {
  https: true,
}
```

### 别名（alias）

webpack alias，用法请看 [webpack alias 文档](https://www.webpackjs.com/configuration/resolve/#resolve-alias)，这里 `.webpack.launcher.js` 配置 简化为：

```js
module.exports = {
  alias: {
    src: path.resolve('./src'),
    // dayjs 可以减少代码量，目前没用到 moment 的地方
    // 大部分 api dayjs 都可以替换 moment
    // 以后用到需要看看有没有影响
    moment: path.resolve('./node_modules/dayjs/dayjs.min.js'),
    // 为了减少打包体积，无需引入多余的 icon
    '@ant-design/icons/lib/dist$': path.resolve('./src/icons.js'),
  },
}
```

### 环境全局变量

即 [webpack DefinePlugin](https://www.webpackjs.com/plugins/define-plugin/) 配置：

```js
new webpack.DefinePlugin({
  PRODUCTION: JSON.stringify(true),
  VERSION: JSON.stringify("5fa3b9"),
  BROWSER_SUPPORTS_HTML5: true,
  TWO: "1+1",
  "typeof window": JSON.stringify("object")
})
```

这里 `.webpack.launcher.js` 配置 简化为：

```js
module.exports = {
  globals: {
    PRODUCTION: JSON.stringify(true),
    VERSION: JSON.stringify("5fa3b9"),
    BROWSER_SUPPORTS_HTML5: true,
    TWO: "1+1",
    "typeof window": JSON.stringify("object")
  },
}
```

### js、css 内容 gzip

这个是新功能，也是 webpack-launcher 的特色，一般开启 gzip 都是在 web 服务器（如 Nginx）处理，web 服务器响应内容给浏览器客户端时会进行内容 gzip 压缩，然后浏览器进行解压后使用。

而使用了此功能，静态文件 js 和 css 文件会被 gzip，无需 web 服务器进行压缩，省略了这一步。如果使用此功能，web 服务器需要做一个特殊处理，响应头需要添加 `Content-Encoding: gzip`（Nginx 不能设置为 gzip: true，而是手动添加响应头）。

`.webpack.launcher.js` 配置如下：

```js
module.exports = {
  buildGzip: true,
}
```

### 热替换

 热替换有两种值选择：

- default

  webpack 默认的热替换热替换方式（需要手动开启），如果你想使用 `react-hot-loader` 你就必须使用此方式。

- create-react-app

  craate-react-app 热替换方式（webpack-launcher 默认开启这个）

###  DLL 功能

如果你使用 webpack 直接配置 dll，那么这将会比较繁杂，但是如果你使用 `webpack-launcher`，那边将会非常简单。

`.webpack.launcher.js` 配置如下：

```js
module.exports = {
  dllEntry: {
    main: [
      'react',
      'react-dom',
    ],
    other: [
      'redux',
      'react-redux',
    ],
  },
}
```

**请确保 node_modules 下提取到 dll 的包已存在**，如果你使用的是 lerna 之类的多包管理工具（monorepo），不用担心，也没问题。

`webpack-launcher dll` 支持多个入口，根据实际项目情况划分即可。

#### 那么怎么生存 dll 代码呢？

这个你完全可以不能担心，只要你运行 `npm start` 或者 `npm run build` ，程序会对比当前的 dllEntry 配置，如果发现 dllEntry 结构、package 版本变化（node_modules package 版本）会自动运行 `npm run build-dll` 命令内容，并生存 dll 文件。dll 生成后的文件位于根目录 `./public/dll` 文件夹下。

没错生存的 dll 文件名都附带 8 位 hash 命名，不存在不同版本缓存问题，所以如果你手动运行了 `npm run build`，那边你需要重启服务。

### 构建 tar.gz 压缩包

`.webpack.launcher.js` 配置如下：

```js
module.exports = {
  tar: `{name}-frontend-v{version}.tar.gz`,
}
```

其中 `{name}` 会替换为 package.json 的 name 字段，`{version}` 会替换为 package.json 的 `version` 字段。

### 构建后的 web 静态服务

为了方便验收构建后的 web app，webpack launcher 也提供了静态服务功能，同时 `.webpack.launcher.js` 的 配置页使用于静态服务（除开 webpack 开发环境相关的配置，如 alias 等）。

`npm run build` 构建成功后，直接运行 `npm run serve-build` 即可（proxy 、mock 配置一样可用）。