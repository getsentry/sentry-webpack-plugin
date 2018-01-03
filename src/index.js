var SentryCli = require('@sentry/cli');

function SentryCliPlugin(options = {}) {
  this.options = options;
  this.options.release = options.release;
  this.options.include =
    options.include &&
    (Array.isArray(options.include) ? options.include : [options.include]);
  this.options.ignore =
    options.ignore && (Array.isArray(options.ignore) ? options.ignore : [options.ignore]);
}

SentryCliPlugin.prototype.apply = function(compiler) {
  var sentryCli = new SentryCli(this.options.configFile);
  var release = this.options.release;
  var include = this.options.include;
  var options = this.options;

  compiler.plugin('after-emit', function(compilation, cb) {
    function handleError(message, cb) {
      compilation.errors.push(`Sentry CLI Plugin: ${message}`);
      return cb();
    }

    if (!release) return handleError('`release` option is required', cb);
    if (!include) return handleError('`include` option is required', cb);

    if (typeof release === 'function') {
      release = release(compilation.hash);
    }

    return sentryCli
      .createRelease(release)
      .then(function() {
        return sentryCli.uploadSourceMaps(options);
      })
      .then(function() {
        return sentryCli.finalizeRelease(release);
      })
      .then(function() {
        return cb();
      })
      .catch(function(err) {
        return handleError(err.message, cb);
      });
  });
};

module.exports = SentryCliPlugin;
