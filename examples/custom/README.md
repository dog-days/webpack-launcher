# custom 例子

-  `.mock.config.js` 配置文件

- `npm i less less-loader -D` 安装 less 需要的包，这样就开启 less 功能。

-  `.babelrc.js` 配置文件，添加 `@bable/react` preset，这样就可以处理 `react jsx` 语法。

-  `.webpack.launcher.js` 配置文件

  - 添加 alias src

  - proxy

  - host 设置为 webpack.launcher.com

  - buildGzip 打包后 js css 文件 都会别 gzip，只有设置了响应头 `Content-Encoding: gzip`

    后才可以访问。只能设置响应头，不要对内容再次 gzip，因为内容本来就 gzip 了。
