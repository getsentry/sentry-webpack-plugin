module.exports = function(content, map, meta) {
  var versionPromise = this.query.versionPromise;
  var callback = this.async();
  versionPromise.then(function(version) {
    var version = (version + '').trim();
    var sentryRelease =
      'global.SENTRY_RELEASE={};\nglobal.SENTRY_RELEASE.id="' + version + '";';
    callback(null, sentryRelease, map, meta);
  });
};
