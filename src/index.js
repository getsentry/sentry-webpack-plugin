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

function injectRelease(compiler, version) {
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
        query: {version}
      }
    ]
  });
}

function replaceInFile(file, source) {
  fs.writeFile(file, source, 'utf8', function(err) {
    if (err) return console.log(err);
  });
}

function replaceRelease(compilation, version) {
  if (typeof compilation.chunks === 'undefined') {
    // Gatekeeper because we are not running in webpack env
    // probably just tests
    return;
  }
  compilation.chunks.forEach(function(chunk) {
    chunk.files.forEach(function(filename) {
      var source = compilation.assets[filename]
        .source()
        .replace('SENTRY_RELEASE.id=""', 'SENTRY_RELEASE.id="' + version + '"');
      replaceInFile(compilation.assets[filename].existsAt, source);
    });
  });
}

SentryCliPlugin.prototype.apply = function(compiler) {
  var sentryCli = new SentryCli(this.options.configFile);
  var release = this.options.release;
  var include = this.options.include;
  var options = this.options;

  injectRelease(compiler, 'global.SENTRY_RELEASE={};\nglobal.SENTRY_RELEASE.id="";');

  compiler.plugin('after-emit', function(compilation, cb) {
    function handleError(message, cb) {
      compilation.errors.push(`Sentry CLI Plugin: ${message}`);
      return cb();
    }

    if (!include) return handleError('`include` option is required', cb);

    if (typeof release === 'function') {
      release = release(compilation.hash);
    }

    var versionPromise = Promise.resolve(release);
    if (typeof release === 'undefined') {
      versionPromise = sentryCli.releases.proposeVersion();
    }

    return versionPromise
      .then(function(proposedVersion) {
        options.release = (proposedVersion + '').trim();
        replaceRelease(compilation, options.release);
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
