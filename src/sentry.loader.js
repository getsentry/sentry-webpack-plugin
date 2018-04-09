module.exports = function sentryLoader(content, map, meta) {
  const callback = this.async();
  this.query.versionPromise.then(version => {
    const newVersion = `${version}`.trim();
    const sentryRelease = `global.SENTRY_RELEASE={};\nglobal.SENTRY_RELEASE.id="${newVersion}";`;
    callback(null, sentryRelease, map, meta);
  });
};
