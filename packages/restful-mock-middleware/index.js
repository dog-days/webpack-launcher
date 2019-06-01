// .mock.config.js 结构 module.exports = function(moacApp){}
// mockApp 只提供了 get、post、patch、put、delete、all，6个 api
// 用法跟 express app 一致（没有 next）
// res.send、res.json、res.jsonp 三种方式都支持 mock.js 语法。
'use strict';

const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const mockjs = require('mockjs');
const _ = require('lodash');
const chalk = require('chalk');
const pathToRegexp = require('path-to-regexp');
const composeMiddlewares = require('webpack-launcher-utils/expressMiddlewareCompose');
const consola = require('consola');

let mockFolder = path.resolve('./mock');
// 文件上传的位置
let uploadDest = path.resolve(mockFolder, './uploads');
let mockConfigFile = path.resolve(mockFolder, '.mock.config.js');
let mockConfigFormatter = function(mockConfig) {
  return mockConfig;
};
// 是否输出日志
let openLogger;

/**
 * 创建 express mock middleware
 * @param {Object} options
 * @param {String} options.mockFolder mock 文件的存储位置，所有的 mock 文件统一放在这个文件夹下
 * @param {Object} options.uploadDest mock 上传文件临时存储的位置
 * 默认为 ./mock/uploads
 * @param {String} options.mockConfigFile 绝对路径 undefined 默认使用当前项目
 * ./mock/.mock.config.js
 * @param {Function} options.mockConfigFormatter 格式化 mockConfigFile 为
 * @param {Function} options.openLogger 是否开启日志
 */
function createMockMiddleware(options = { openLogger: true }) {
  if (options.mockConfigFile) {
    mockConfigFile = options.mockConfigFile;
  }
  if (options.mockFolder) {
    mockFolder = options.mockFolder;
  }
  if (options.uploadDest) {
    uploadDest = options.uploadDest;
  }
  if (options.mockConfigFormatter) {
    mockConfigFormatter = options.mockConfigFormatter;
  }
  openLogger = options.openLogger;

  return function(req, res, next) {
    // 只有 mockConfig 配置文件存在才处理
    if (fs.existsSync(mockConfigFile)) {
      // 会创建 ./mock/uploads 文件夹
      // 所以只有 mock 的时候触发
      const uploadBodyParser = multer({ dest: uploadDest });
      // 多个 middleware 一起处理
      composeMiddlewares([
        bodyParser.json(),
        bodyParser.raw(),
        bodyParser.text(),
        bodyParser.urlencoded({ extended: true }),
        uploadBodyParser.any(),
        // mock 需要放在 body 解析之后
        mockMiddleware,
      ])(req, res, next);
    } else {
      next();
    }
  };
}

/**
 * 创建 mock middleware
 * 跟 express 的 router 用法一致
 * @return express middleware
 */
function mockMiddleware(req, res, next) {
  if (fs.existsSync(uploadDest)) {
    // 清空上传的文件
    fs.emptyDir(uploadDest, err => {
      if (err) return consola.error(err);
    });
  }
  let mockConfig;
  try {
    // 删除 mock 配置文件 js require 缓存
    delete require.cache[mockConfigFile];
    // 删除 mock 文件夹的 js require 缓存，可动态 mock 文件夹下的所有 js 文件
    Object.keys(require.cache).forEach(file => {
      if (!!~file.indexOf(mockFolder)) {
        delete require.cache[file];
      }
    });
    mockConfig = mockConfigFormatter(require(mockConfigFile));
  } catch (err) {
    consola.log(chalk.red(err.stack));
    next();
    return;
  }
  const createMockAppInstance = new createMockApp(req, res, next, { openLogger });
  mockConfig(createMockAppInstance.getMockApp());
  createMockAppInstance.run();
}

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;

class createMockApp {
  constructor(req, res, next, options = {}) {
    this.req = req;
    this.res = this.getRewritedRes(res, req);
    this.next = next;
    this.options = options;
    // 每个匹配到的 mock api 都会有一个回调，可以响应内容
    // 结构为 { [method]: [callback] }
    // callback 参数为 req 和 res
    this.resultCallbackObj = undefined;
    this.logger = createLogger({ openLogger: options.openLogger });
  }
  /**
   * 重写 res.json res.jsonp res.send，如果是 plain object 则使用 mockjs 处理
   * @param {Object} res express response 对象
   * @returns {Object} res
   */
  getRewritedRes(res, req) {
    function rewritelWithMockJs(method) {
      const tempResMethod = res[method].bind(res);
      res[method] = function(body) {
        if (_.isPlainObject(body)) {
          body = mockjs.mock(body);
        }
        tempResMethod(body);
        req.body = body;
      };
    }
    rewritelWithMockJs('json');
    rewritelWithMockJs('jsonp');
    rewritelWithMockJs('send');
    return res;
  }

  getMockApp() {
    const method = this.method;
    // 不支持 options 和 head
    return {
      all: method.bind(this, 'any'),
      get: method.bind(this, 'GET'),
      delete: method.bind(this, 'DELETE'),
      post: method.bind(this, 'POST'),
      put: method.bind(this, 'PUT'),
      patch: method.bind(this, 'PATCH'),
    };
  }

  compilePath(path, options) {
    const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
    const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

    if (pathCache[path]) return pathCache[path];

    const keys = [];
    const regexp = pathToRegexp(path, keys, options);
    const result = { regexp, keys };

    if (cacheCount < cacheLimit) {
      pathCache[path] = result;
      cacheCount++;
    }

    return result;
  }

  /**
   *
   * @param {String} method GET POST DELETE PUT PATCH
   * @param {String} path mock 路由路径配置
   */
  use(method, path, callback) {
    if (!_.isFunction(callback)) {
      throw new TypeError('Expected the callback to be a funciton.');
    }

    const currentUrl = this.req.url;
    const { regexp, keys } = this.compilePath(path, {
      end: true,
      strict: false,
      sensitive: true,
    });
    const match = regexp.exec(currentUrl);

    if (!match) {
      return;
    }

    // eslint-disable-next-line
    const [noop, ...values] = match;
    this.req.params = keys.reduce((memo, key, index) => {
      memo[key.name] = values[index];
      return memo;
    }, {});

    // 在 callback 函数中绑上 method 值
    callback.method = method;
    this.resultCallbackObj = {
      ...this.resultCallbackObj,
      [method]: callback,
    };
  }
  method(method = 'GET', ...args) {
    this.use(method, ...args);
  }
  run() {
    const req = this.req;
    const res = this.res;
    const logger = this.logger;
    const loggerFormator = statusCode => {
      return [statusCode || res.statusCode, chalk.cyan(req.method), chalk.grey(req.url)];
    };

    if (this.resultCallbackObj) {
      const resultCallback = this.resultCallbackObj[req.method] || this.resultCallbackObj['any'];
      if (!resultCallback) {
        res.sendStatus(405);
        logger.error(...loggerFormator());
      } else {
        try {
          resultCallback(req, res);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            logger.success(...loggerFormator());
          } else {
            logger.fail(...loggerFormator());
          }
          // logger.info(req.body);
        } catch (err) {
          // 语法错误等
          res.status(500).send(err.stack);
          logger.error(...loggerFormator());
        }
      }
    } else {
      this.next();
      logger.error(...loggerFormator(404));
    }
  }
}

function createLogger(options = { openLogger: true }) {
  if (openLogger) {
    const logger = consola.create({
      defaults: {
        message: chalk.bgHex('#409EFF').black(' Mock '),
        badge: true,
        tag: 'mock',
      },
    });
    logger.fail = function(...args) {
      logger.log({
        level: 0,
        type: 'fail',
        message: chalk.bgHex('#409EFF').black(' Mock '),
        args,
      });
    };
    return logger;
  } else {
    return {
      fatal: () => {},
      error: () => {},
      warn: () => {},
      log: () => {},
      info: () => {},
      success: () => {},
      fail: () => {},
      debug: () => {},
      trace: () => {},
      silent: () => {},
      ready: () => {},
      start: () => {},
    };
  }
}

module.exports = createMockMiddleware;
