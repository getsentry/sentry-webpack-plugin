module.exports = function sentryLoader(content, map, meta) {
  const { releasePromise } = this.query;
  const callback = this.async();
  releasePromise.then(version => {
    const newVersion = version;
    const sentryRelease = `global.SENTRY_RELEASE={};\nglobal.SENTRY_RELEASE.id="${newVersion}";`;
    callback(null, sentryRelease, map, meta);
  });
};
