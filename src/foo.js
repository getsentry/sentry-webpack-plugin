var errorWrapper = require('./bar')

module.exports = function moduleError(errorCallback) {
  errorWrapper(errorCallback)
}
