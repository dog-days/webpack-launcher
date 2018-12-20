'use strict';

const httpProxyMiddleware = require('http-proxy-middleware');
const composeMiddlewares = require('webpack-launcher-utils/express-middleware-compose');

/**
 * 从 webpack-dev-server 抽离的 proxy middleware
 * 不包含 wsProxy
 * @param {Object | Array} 请看 https://webpack.js.org/configuration/dev-server/#devserver-proxy
 * @param {Object} server express server 实例
 */
function createProxyMiddleware(proxy, server) {
  if (proxy) {
    /**
     * Assume a proxy configuration specified as:
     * proxy: {
     *   'context': { options }
     * }
     * OR
     * proxy: {
     *   'context': 'target'
     * }
     */
    if (!Array.isArray(proxy)) {
      proxy = Object.keys(proxy).map(context => {
        let proxyOptions;
        // For backwards compatibility reasons.
        const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

        if (typeof proxy[context] === 'string') {
          proxyOptions = {
            context: correctedContext,
            target: proxy[context],
          };
        } else {
          proxyOptions = Object.assign({}, proxy[context]);
          proxyOptions.context = correctedContext;
        }

        proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

        return proxyOptions;
      });
    }
  }
  const getHttpProxyMiddleware = proxyConfig => {
    const context = proxyConfig.context || proxyConfig.path;
    // It is possible to use the `bypass` method without a `target`.
    // However, the proxy middleware has no use in this case, and will fail to instantiate.
    if (proxyConfig.target) {
      return httpProxyMiddleware(context, proxyConfig);
    }
  };
  return function(req, res, next) {
    if (!proxy) {
      next();
      return;
    }
    const websocketProxies = [];
    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: ...,
     *     ...options...
     *   },
     *   // or:
     *   function() {
     *     return {
     *       context: ...,
     *       ...options...
     *     };
     *   }
     * ]
     */
    const proxyMiddlewares = proxy.map(proxyConfigOrCallback => {
      return function sigaleProxyMiddleware(req, res, next) {
        let proxyConfig;
        let proxyMiddleware;
        if (typeof proxyConfigOrCallback === 'function') {
          proxyConfig = proxyConfigOrCallback();
        } else {
          proxyConfig = proxyConfigOrCallback;
        }

        if (proxyConfig.ws) {
          websocketProxies.push(proxyMiddleware);
        }

        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback();

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getHttpProxyMiddleware(proxyConfig);
          }
        } else {
          proxyMiddleware = getHttpProxyMiddleware(proxyConfig);
        }

        const bypass = typeof proxyConfig.bypass === 'function';

        const bypassUrl = (bypass && proxyConfig.bypass(req, res, proxyConfig)) || false;

        if (bypassUrl) {
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      };
    });

    if (proxyMiddlewares.length < 1) {
      // 空 proxy，需要运行 next，进行下一步
      next();
    } else {
      // 多个 middleware 一起处理
      composeMiddlewares(proxyMiddlewares)(req, res, next);
    }
    if (server) {
      websocketProxies.forEach(function(wsProxy) {
        server.on('upgrade', wsProxy.upgrade);
      });
    }
  };
}

module.exports = createProxyMiddleware;
