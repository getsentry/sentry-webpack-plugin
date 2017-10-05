var SentryCli = require('./sentry-cli');

function SentryCliPlugin(options) {
  options = options || {};
  this.release = options.release;
  this.paths =
    options.paths && (Array.isArray(options.paths) ? options.paths : [options.paths]);
  this.config = options.config;
}

SentryCliPlugin.prototype.apply = function(compiler) {
  var sentryCli = new SentryCli(this.config);
  var release = this.release;
  var paths = this.paths;

  compiler.plugin('after-emit', function(compilation, cb) {
    function handleError(message, cb) {
      compilation.errors.push(`Sentry CLI Plugin: ${message}`);
      return cb();
    }

    if (!release) return handleError('`release` option is required', cb);
    if (!paths) return handleError('`paths` option is required', cb);

    if (typeof release === 'function') {
      release = release(compilation.hash);
    }

    return sentryCli
      .createRelease(release)
      .then(function() {
        return sentryCli.uploadSourceMaps(release, paths);
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
