'use strict';

/**
 *  ctr + c 退出程序等
 * @param {Function} callback 回调
 */
function signtSigtermProcessEvent(callback) {
  ['SIGINT', 'SIGTERM'].forEach(function(sig) {
    // ctr + c 退出程序
    process.on(sig, function() {
      callback && callback();
    });
  });
}
module.exports = signtSigtermProcessEvent;
