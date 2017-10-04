const childProcess = require('child_process');
const sentryCli = require('sentry-cli-binary').getPath();

function executeSentryCli(args) {
  return new Promise(function(resolve, reject) {
    childProcess.execFile(sentryCli, args, function(err, stdout) {
      if (err) return reject(err);
      console.log(stdout);
      return resolve();
    });
  });
}

module.exports = class SentryPlugin {
  constructor(options = {}) {
    this.release = options.release;
    this.paths = Array.isArray(options.paths) ? options.paths : [options.paths];
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, cb) => {
      if (!this.release) return this.handleError('`release` option is required', cb);
      if (!this.paths) return this.handleError('`paths` option is required', cb);

      if (typeof this.release === 'function') {
        this.release = this.release(compilation.hash);
      }

      return this.createRelease(this.release)
        .then(_ => this.uploadSourceMaps(this.release, this.paths))
        .then(_ => this.finalizeRelease(this.release))
        .then(_ => cb())
        .catch(err => this.handleError(err.message, cb));
    });
  }

  handleError(message, cb) {
    compilation.errors.push(`Sentry CLI Plugin: ${message}`);
    return cb();
  }

  createRelease(release) {
    return executeSentryCli(['releases', 'new', release]);
  }

  finalizeRelease(release) {
    return executeSentryCli(['releases', 'finalize', release]);
  }

  uploadSourceMaps(release, paths) {
    return Promise.all(
      paths.map(path =>
        executeSentryCli([
          'releases',
          'files',
          release,
          'upload-sourcemaps',
          path,
          '--rewrite'
        ])
      )
    );
  }
};
