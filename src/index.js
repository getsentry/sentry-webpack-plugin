'use strict';

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

  if (typeof originalEntry === 'function') {
    return () =>
      Promise.resolve(originalEntry()).then(entry => injectEntry(entry, newEntry));
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
  if (typeof changedCompiler.options.module === 'undefined') {
    changedCompiler.options.module = {};
  }

  // Handle old `module.loaders` syntax
  if (typeof changedCompiler.options.module.loaders !== 'undefined') {
    changedCompiler.options.module.loaders.push({
      test: /sentry-webpack\.module\.js$/,
      loader: path.resolve(__dirname, 'sentry.loader.js'),
      options: { versionPromise },
    });
  } else {
    if (typeof changedCompiler.options.module.rules === 'undefined') {
      changedCompiler.options.module.rules = [];
    }
    changedCompiler.options.module.rules.push({
      test: /sentry-webpack\.module\.js$/,
      use: [
        {
          loader: path.resolve(__dirname, 'sentry.loader.js'),
          options: { versionPromise },
        },
      ],
    });
  }
}

class SentryCliPlugin {
  constructor(options) {
    // By default we want that rewrite is true
    this.options = Object.assign({ rewrite: true }, options || {});
    this.options.include =
      options.include &&
      (Array.isArray(options.include) ? options.include : [options.include]);
    this.options.ignore =
      options.ignore &&
      (Array.isArray(options.ignore) ? options.ignore : [options.ignore]);

    this.dryRun = this.options.dryRun === true;
  }

  getSentryCli() {
    if (!this.dryRun) {
      return new SentryCli(this.options.configFile);
    }
    return {
      releases: {
        proposeVersion: () => Promise.resolve('1.0.0-dev'),
        new: () => Promise.resolve(),
        uploadSourceMaps: () => Promise.resolve(),
        finalize: () => Promise.resolve(),
      },
    };
  }
  attachAfterEmitHook(compiler, callback) {
    // Backwards compatible version of: compiler.plugin.afterEmit.tapAsync()
    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync('SentryCliPlugin', callback);
    } else {
      compiler.plugin('after-emit', callback);
    }
  }

  apply(compiler) {
    const sentryCli = this.getSentryCli();
    const release = this.options.release;
    const include = this.options.include;

    let versionPromise = Promise.resolve(release);
    if (typeof release === 'undefined') {
      versionPromise = sentryCli.releases.proposeVersion();
    }

    injectRelease(compiler, versionPromise);

    this.attachAfterEmitHook(compiler, (compilation, cb) => {
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
