var SentryCli = require('@sentry/cli');

function SentryCliPlugin(options) {
  options = options || {};
  this.release = options.release;
  this.include =
    options.include &&
    (Array.isArray(options.include) ? options.include : [options.include]);
  this.configFile = options.configFile;
  this.ignoreFile = options.ignoreFile;
  this.ignore =
    options.ignore && (Array.isArray(options.ignore) ? options.ignore : [options.ignore]);
}

SentryCliPlugin.prototype.apply = function(compiler) {
  var sentryCli = new SentryCli(this.configFile);
  var release = this.release;
  var include = this.include;
  var ignoreFile = this.ignoreFile;
  var ignore = this.ignore;

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
        return sentryCli.uploadSourceMaps({
          release: release,
          include: include,
          ignoreFile: ignoreFile,
          ignore: ignore
        });
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
