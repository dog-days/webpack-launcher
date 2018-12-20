'use strict';

/**
 * 从左到右合并 express middleware
 * @param {array} middlewares The express middlewares
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
  // arrow function 返回 "{}"，可读性更好
  return middlewares.reduce(function(a, b) {
    return function(req, res, next) {
      return a(req, res, function() {
        b(req, res, next);
      });
    };
  });
}
module.exports = compose;
