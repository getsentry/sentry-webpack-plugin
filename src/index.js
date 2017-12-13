var SentryCli = require('@sentry/cli');

var SOURCEMAPS_OPTIONS = [
  'release',
  'configFile',
  'include',
  'ignore',
  'ignoreFile',
  'noSourceMapReference',
  'stripPrefix',
  'stripCommonPrefix',
  'validate',
  'urlPrefix',
  'ext'
];

function SentryCliPlugin(options) {
  options = options || {};

  SOURCEMAPS_OPTIONS.forEach(sourceMapOption => {
    if (typeof options[sourceMapOption] !== 'undefined') {
      if (sourceMapOption === 'ignore' || sourceMapOption == 'include') {
        this[sourceMapOption] = Array.isArray(options[sourceMapOption])
          ? options[sourceMapOption]
          : (this[sourceMapOption] = [options[sourceMapOption]]);
      }
      this[sourceMapOption] = options[sourceMapOption];
    }
  });
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
        return sentryCli.uploadSourceMaps(this);
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

module.exports = SentryCliPlugin;
