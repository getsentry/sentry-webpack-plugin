module.exports = function sentryLoader(content, map, meta) {
  const { releasePromise } = this.query;
  const callback = this.async();
  releasePromise.then(version => {
    const sentryRelease = `(window||global||self).SENTRY_RELEASE={id:"${version}"};`;
    callback(null, sentryRelease, map, meta);
  });
};
