const SentryCli = require('@sentry/cli');
const path = require('path');

function injectEntry(originalEntry, newEntry) {
  if (Array.isArray(originalEntry)) {
    return [newEntry].concat(originalEntry);
  }

  if (originalEntry !== null && typeof originalEntry === 'object') {
    const nextEntries = {};
    Object.keys(originalEntry).forEach(key => {
      nextEntries[key] = injectEntry(originalEntry[key], newEntry);
    });
    return nextEntries;
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
  const changedCompiler = compiler;
  changedCompiler.options.entry = injectEntry(
    changedCompiler.options.entry,
    path.join(__dirname, 'sentry-webpack.module.js')
  );
  changedCompiler.options.module = {};
  changedCompiler.options.module.rules = [];
  changedCompiler.options.module.rules.push({
    test: /sentry-webpack\.module\.js$/,
    use: [
      {
        loader: path.resolve(__dirname, 'sentry.loader.js'),
        query: { versionPromise },
      },
    ],
  });
}

class SentryCliPlugin {
  constructor(options = {}) {
    // By default we want that rewrite is true
    this.options = Object.assign({ rewrite: true }, options);
    this.options.include =
      options.include &&
      (Array.isArray(options.include) ? options.include : [options.include]);
    this.options.ignore =
      options.ignore &&
      (Array.isArray(options.ignore) ? options.ignore : [options.ignore]);
  }

  apply(compiler) {
    const sentryCli = new SentryCli(this.options.configFile);
    const { release, include } = this.options;

    let versionPromise = Promise.resolve(release);
    if (typeof release === 'undefined') {
      versionPromise = sentryCli.releases.proposeVersion();
    }

    injectRelease(compiler, versionPromise);

    compiler.plugin('after-emit', (compilation, cb) => {
      function handleError(message, errorCb) {
        compilation.errors.push(`Sentry CLI Plugin: ${message}`);
        return errorCb();
      }

      if (!include) return handleError('`include` option is required', cb);

      return versionPromise
        .then(proposedVersion => {
          this.options.release = `${proposedVersion}`.trim();
          return sentryCli.releases.new(this.options.release);
        })
        .then(() =>
          sentryCli.releases.uploadSourceMaps(this.options.release, this.options)
        )
        .then(() => sentryCli.releases.finalize(this.options.release))
        .then(() => cb())
        .catch(err => handleError(err.message, cb));
    });
  }
}

module.exports = SentryCliPlugin;
