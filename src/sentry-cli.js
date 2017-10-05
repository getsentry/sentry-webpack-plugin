var childProcess = require('child_process');
var sentryCli = require('sentry-cli-binary').getPath();

function SentryCli(config) {
  this.env = {};
  if (typeof config === 'string') this.env.SENTRY_PROPERTIES = config;
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

SentryCli.prototype.uploadSourceMaps = function(release, paths) {
  return Promise.all(
    paths.map(
      function(path) {
        return this.execute([
          'releases',
          'files',
          release,
          'upload-sourcemaps',
          path,
          '--rewrite'
        ]);
      }.bind(this)
    )
  );
};

module.exports = SentryCli;
