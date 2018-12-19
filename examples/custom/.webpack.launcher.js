'use strict';
const path = require('path');

module.exports = {
  host: 'webpack.launcher.com',
  proxy: {
    '/cigweb/v1/': 'http://cig.whtest.topvdn.com:57165/',
    '/v3/assistant/': {
      target: 'https://restapi.amap.com/',
      // https 不要做安全检测 false
      secure: false,
      // 高德做了域名限制
      // It is useful in some cases like using name-based virtual hosted sites.
      // https://en.wikipedia.org/wiki/Virtual_hosting#Name-based
      changeOrigin: true,
    },
  },
  alias: {
    src: path.resolve('./src'),
  },
};
