/* eslint-disable no-console */
const fs = require('fs');

console.log();
console.log('--------------------');
console.log('TESTING BUNDLE');
console.log('--------------------');
console.log();

const content = fs.readFileSync('./dist/main.bundle.js');
if (
  content
    .toString()
    .indexOf(
      `var _global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};`
    ) !== -1
) {
  console.log('Saul Goodman, found "var _global" assignment in bundle');
} else {
  console.error('Boom, did not find "var _global" assignment in bundle');
  process.exit(1);
}

if (
  content.toString().indexOf(
    `_global.SENTRY_RELEASE = {
  id: "foo"
};`
  ) !== -1
) {
  console.log('Saul Goodman, found SENTRY_RELEASE in bundle');
} else {
  console.error('Boom, did not find SENTRY_RELEASE in bundle');
  process.exit(1);
}

if (
  content.toString().indexOf(
    `_global.SENTRY_RELEASES = _global.SENTRY_RELEASES || {};
_global.SENTRY_RELEASES["my-project@my-org"] = {
  id: "foo"
};`
  ) !== -1
) {
  console.log('Saul Goodman, found SENTRY_RELEASES assignment in bundle');
} else {
  console.error('Boom, did not find SENTRY_RELEASES assignment in bundle');
  process.exit(1);
}
