var childProcess = require('child_process');
var sentryCli = require('sentry-cli-binary').getPath();

var DEFAULT_IGNORE = ['node_modules'];

function SentryCli(configFile) {
  this.env = {};
  if (typeof configFile === 'string') this.env.SENTRY_PROPERTIES = configFile;
}

SentryCli.prototype.execute = function(args) {
  var env = this.env;

  return new Promise(function(resolve, reject) {
    childProcess.execFile(sentryCli, args, {env: env}, function(err, stdout) {
      if (err) return reject(err);
      console.log(stdout);
      return resolve();
    });
  });
};

SentryCli.prototype.createRelease = function(release) {
  return this.execute(['releases', 'new', release]);
};

SentryCli.prototype.finalizeRelease = function(release) {
  return this.execute(['releases', 'finalize', release]);
};

SentryCli.prototype.uploadSourceMaps = function(options) {
  return Promise.all(
    options.include.map(
      function(path) {
        var command = [
          'releases',
          'files',
          options.release,
          'upload-sourcemaps',
          path,
          '--rewrite'
        ];

        if (options.ignoreFile) {
          command = command.concat(['--ignore-file', options.ignoreFile]);
        }

        if (options.ignore) {
          command = command.concat(transformIgnore(options.ignore));
        }

        if (!options.ignoreFile && !options.ignore) {
          command = command.concat(transformIgnore(DEFAULT_IGNORE));
        }

        return this.execute(command);
      }.bind(this)
    )
  );
};

function transformIgnore(ignore) {
  if (Array.isArray(ignore)) {
    return ignore
      .map(function(value) {
        return ['--ignore', value];
      })
      .reduce(function(acc, value) {
        return acc.concat(value);
      }, []);
  } else {
    return ['--ignore' + ignore];
  }
}

module.exports = SentryCli;
