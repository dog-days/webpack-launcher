'use strict';
const path = require('path');

module.exports = {
  proxy: {
    '/cigweb/v1/': 'http://cig.whtest.topvdn.com:57165/',
  },
  alias: {
    src: path.resolve('./src'),
  },
};
