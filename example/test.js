const fs = require('fs');

console.log();
console.log('--------------------');
console.log('TESTING BUNDLE');
console.log('--------------------');
console.log();

const content = fs.readFileSync('./dist/main.bundle.js');
if (
  content.toString()
    .indexOf(`(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}).SENTRY_RELEASE = {
  id: "foo"
}`) !== -1
) {
  console.log('Saul Goodman, found SENTRY_RELEASE in bundle');
  process.exit(0);
} else {
  console.error('Boom, did not find SENTRY_RELEASE in bundle');
  process.exit(1);
}
