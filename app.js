var moduleError = require('./src/foo')

try {
  moduleError(function errorCallback(message) {
    throw new Error(message)
  })
} catch (o_O) {
  throw o_O
}
