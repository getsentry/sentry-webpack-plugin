const fs = require('fs');

console.log();
console.log('--------------------');
console.log('TESTING BUNDLE');
console.log('--------------------');
console.log();

const content = fs.readFileSync('./dist/main.bundle.js');
if (
  content.toString().match(`(window || global || self).SENTRY_RELEASE = {
  id: "foo"
}`)
) {
  console.log('Saul Goodman, found SENTRY_RELEASE in bundle');
  process.exit(0);
} else {
  console.error('Boom, did not find SENTRY_RELEASE in bundle');
  process.exit(1);
}
