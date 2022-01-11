module.exports = function sentryLoader(content, map, meta) {
  const { releasePromise, org, project } = this.query;
  const callback = this.async();
  releasePromise.then(version => {
    let sentryRelease = `var _global = (typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}); _global.SENTRY_RELEASE={id:"${version}"};`;
    if (project) {
      const key = org ? `${project}@${org}` : project;
      sentryRelease += `
      _global.SENTRY_RELEASES=_global.SENTRY_RELEASES || {};
      _global.SENTRY_RELEASES["${key}"]={id:"${version}"};
      `;
    }
    callback(null, sentryRelease, map, meta);
  });
};
