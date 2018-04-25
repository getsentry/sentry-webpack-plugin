const SentryCli = require('@sentry/cli');
const path = require('path');

const SENTRY_LOADER = path.resolve(__dirname, 'sentry.loader.js');
const SENTRY_MODULE = path.resolve(__dirname, 'sentry-webpack.module.js');

/**
 * Helper function that ensures an object key is defined. This mutates target!
 *
 * @param {object} target The target object
 * @param {string} key The object key
 * @param {function} factory A function that creates the new element
 * @returns {any} The existing or created element.
 */
function ensure(target, key, factory) {
  // eslint-disable-next-line no-param-reassign
  target[key] = typeof target[key] !== 'undefined' ? target[key] : factory();
  return target[key];
}

/**
 * Ensures that the passed value is in an array or an array itself.
 *
 * @param {any} value Either an array or a value that should be wrapped
 * @returns {array} The array
 */
function toArray(value) {
  return !value || Array.isArray(value) ? value : [value];
}

/** Backwards compatible version of `compiler.plugin.afterEmit.tapAsync()`. */
function attachAfterEmitHook(compiler, callback) {
  if (compiler.hooks) {
    compiler.hooks.afterEmit.tapAsync('SentryCliPlugin', callback);
  } else {
    compiler.plugin('after-emit', callback);
  }
}

/** Convenience function to add a webpack compilation error. */
function addCompilationError(compilation, message) {
  compilation.errors.push(`Sentry CLI Plugin: ${message}`);
}

class SentryCliPlugin {
  constructor(options = {}) {
    // By default we want that rewrite is true
    this.options = Object.assign({ rewrite: true }, options);
    this.options.include = toArray(options.include);
    this.options.ignore = toArray(options.ignore);

    this.cli = this.getSentryCli();
    this.release = this.getReleasePromise();
  }

  /** Returns whether this plugin is in dryRun mode. */
  isDryRun() {
    return this.options.dryRun === true;
  }

  /** Creates a new Sentry CLI instance. */
  getSentryCli() {
    if (this.isDryRun()) {
      return {
        releases: {
          proposeVersion: () => Promise.resolve('1.0.0-dev'),
          new: () => Promise.resolve(),
          uploadSourceMaps: () => Promise.resolve(),
          finalize: () => Promise.resolve(),
        },
      };
    }

    return new SentryCli(this.options.configFile);
  }

  /**
   * Returns a Promise that will solve to the configured release.
   *
   * If no release is specified, it uses Sentry CLI to propose a version. The
   * release string is always trimmed.
   */
  getReleasePromise() {
    return (this.options.release
      ? Promise.resolve(this.options.release)
      : this.cli.releases.proposeVersion()
    ).then(version => `${version}`.trim());
  }

  /** Checks if the given named entry point should be handled. */
  checkEntry(key) {
    const { entries } = this.options;
    if (entries == null) {
      return true;
    }

    if (typeof entries === 'function') {
      return entries(key);
    }

    if (entries instanceof RegExp) {
      return entries.test(key);
    }

    if (Array.isArray(entries)) {
      return entries.includes(key);
    }

    throw new Error(
      'Invalid `entries` option: Must be an array, RegExp or function'
    );
  }

  /** Injects the release string into the given entry point. */
  injectEntry(originalEntry, newEntry) {
    if (Array.isArray(originalEntry)) {
      return [newEntry].concat(originalEntry);
    }

    if (originalEntry !== null && typeof originalEntry === 'object') {
      return Object.keys(originalEntry).reduce((acc, key) => {
        acc[key] = this.checkEntry(key)
          ? this.injectEntry(originalEntry[key], newEntry)
          : originalEntry[key];
        return acc;
      }, {});
    }

    if (typeof originalEntry === 'string') {
      return [newEntry, originalEntry];
    }

    if (typeof originalEntry === 'function') {
      return () =>
        Promise.resolve(originalEntry()).then(entry =>
          this.injectEntry(entry, newEntry)
        );
    }

    return newEntry;
  }

  /** Webpack 2: Adds a new loader for the release module. */
  injectLoader(loaders) {
    const loader = {
      test: /sentry-webpack\.module\.js$/,
      loader: SENTRY_LOADER,
      options: { releasePromise: this.release },
    };

    return loaders.concat([loader]);
  }

  /** Webpack 3+: Injects a new rule for the release module. */
  injectRule(rules) {
    const rule = {
      test: /sentry-webpack\.module\.js$/,
      use: [
        {
          loader: SENTRY_LOADER,
          options: { releasePromise: this.release },
        },
      ],
    };

    return rules.concat([rule]);
  }

  /** Injects the release entry points and rules into the given options. */
  injectRelease(compilerOptions) {
    const options = compilerOptions;
    if (typeof options === 'undefined') {
      // Gatekeeper because we are not running in webpack env, probably just tests
      return;
    }

    options.entry = this.injectEntry(options.entry, SENTRY_MODULE);

    const mod = ensure(options, 'module', Object);
    if (mod.loaders) {
      // Handle old `module.loaders` syntax
      mod.loaders = this.injectLoader(mod.loaders);
    } else {
      mod.rules = this.injectRule(mod.rules || []);
    }
  }

  /** Creates and finalizes a release on Sentry. */
  finalizeRelease(compilation) {
    const { include } = this.options;

    if (!include) {
      addCompilationError(compilation, '`include` option is required');
      return Promise.resolve();
    }

    let release;
    return this.release
      .then(proposedVersion => {
        release = proposedVersion;
        return this.cli.releases.new(release);
      })
      .then(() => this.cli.releases.uploadSourceMaps(release, this.options))
      .then(() => this.cli.releases.finalize(release))
      .catch(err => addCompilationError(compilation, err.message));
  }

  /** Webpack lifecycle hook to update compiler options. */
  apply(compiler) {
    this.injectRelease(compiler.options);
    attachAfterEmitHook(compiler, (compilation, cb) => {
      this.finalizeRelease(compilation).then(() => cb());
    });
  }
}

module.exports = SentryCliPlugin;
