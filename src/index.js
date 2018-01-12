var SentryCli = require('@sentry/cli');
var path = require('path');
var fs = require('fs');

function SentryCliPlugin(options = {}) {
  // By default we want that rewrite is true
  this.options = Object.assign({rewrite: true}, options);
  this.options.include =
    options.include &&
    (Array.isArray(options.include) ? options.include : [options.include]);
  this.options.ignore =
    options.ignore && (Array.isArray(options.ignore) ? options.ignore : [options.ignore]);
}

function injectEntry(originalEntry, newEntry) {
  console.log(originalEntry);
  if (Array.isArray(originalEntry)) {
    originalEntry.unshift(newEntry);
    return originalEntry;
  }

  if (typeof originalEntry === 'string') {
    return [newEntry, originalEntry];
  }

  return newEntry;
}

function injectRelease(compiler, versionPromise) {
  if (typeof compiler.options === 'undefined') {
    // Gatekeeper because we are not running in webpack env
    // probably just tests
    return;
  }
  compiler.options.entry = injectEntry(
    compiler.options.entry,
    path.join(__dirname, 'sentry-webpack.module.js')
  );
  compiler.options.module = {};
  compiler.options.module.rules = [];
  compiler.options.module.rules.push({
    test: /sentry-webpack\.module\.js$/,
    use: [
      {
        loader: path.resolve(__dirname, 'sentry.loader.js'),
        query: {versionPromise}
      }
    ]
  });
}

SentryCliPlugin.prototype.apply = function(compiler) {
  var sentryCli = new SentryCli(this.options.configFile);
  var release = this.options.release;
  var include = this.options.include;
  var options = this.options;

  var versionPromise = Promise.resolve(release);
  if (typeof release === 'undefined') {
    versionPromise = sentryCli.releases.proposeVersion();
  }

  injectRelease(compiler, versionPromise);

  compiler.plugin('after-emit', function(compilation, cb) {
    function handleError(message, cb) {
      compilation.errors.push(`Sentry CLI Plugin: ${message}`);
      return cb();
    }

    if (!include) return handleError('`include` option is required', cb);

    return versionPromise
      .then(function(proposedVersion) {
        options.release = (proposedVersion + '').trim();
        return sentryCli.releases.new(options.release);
      })
      .then(function() {
        return sentryCli.releases.uploadSourceMaps(options.release, options);
      })
      .then(function() {
        return sentryCli.releases.finalize(options.release);
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
