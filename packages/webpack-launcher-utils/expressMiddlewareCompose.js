'use strict';

/**
 * 从左到右（数组）合并 express middleware，避免回调地狱
 * 暂时不支持 express error middleware
 * middlewares 的执行顺序从左到右，这个跟 redux 的 compose 的顺序相反（因为 next 回调）
 * @param {Array} middlewares The express middlewares
 * @returns {Function} 返回一个组合的 express middleware
 * 例如 compose(f, g, h) 会组合为：
 * (req,res,next) => f(req,res,g(req,res,h(req,res,next)))
 */
function compose(middlewares) {
  if (middlewares.length === 0) {
    return function() {
      // noop
    };
  }
  if (middlewares.length === 1) {
    return middlewares[0];
  }
  // 这个逻辑需要一点思考，arrow function 可读性不好
  return middlewares.reduce(function(a, b) {
    return function(req, res, next) {
      return a(req, res, function() {
        b(req, res, next);
      });
    };
  });
}
module.exports = compose;
