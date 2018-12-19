'use strict';

const httpProxyMiddleware = require('http-proxy-middleware');

/**
 * 从 webpack-dev-server 抽离的 proxy middleware
 * 不包含 wsProxy
 */
function createProxyMiddleware(proxy) {
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
    // 多个 middleware 一起处理
    proxyMiddlewares.reduce(function(a, b) {
      return function(req, res, next) {
        return a(req, res, function() {
          b(req, res, next);
        });
      };
    })(req, res, next);
  };
}

module.exports = createProxyMiddleware;
