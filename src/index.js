var childProcess = require('child_process');
var sentryCli = require('sentry-cli-binary').getPath();

function SentryCliPlugin(options) {
  options = options || {};
  this.release = options.release;
  this.paths =
    options.paths && (Array.isArray(options.paths) ? options.paths : [options.paths]);
  if (typeof options.config === 'string') process.env.SENTRY_PROPERTIES = options.config;
}

SentryCliPlugin.prototype.apply = function(compiler) {
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

    return createRelease(release)
      .then(function() {
        return uploadSourceMaps(release, paths);
      })
      .then(function() {
        return finalizeRelease(release);
      })
      .then(function() {
        return cb();
      })
      .catch(function(err) {
        return handleError(err.message, cb);
      });
  });
};

function executeSentryCli(args) {
  return new Promise(function(resolve, reject) {
    childProcess.execFile(sentryCli, args, function(err, stdout) {
      if (err) return reject(err);
      console.log(stdout);
      return resolve();
    });
  });
}

function createRelease(release) {
  return executeSentryCli(['releases', 'new', release]);
}

function finalizeRelease(release) {
  return executeSentryCli(['releases', 'finalize', release]);
}

function uploadSourceMaps(release, paths) {
  return Promise.all(
    paths.map(function(path) {
      return executeSentryCli([
        'releases',
        'files',
        release,
        'upload-sourcemaps',
        path,
        '--rewrite'
      ]);
    })
  );
}

module.exports = SentryCliPlugin;
