const fs = require('fs');

console.log();
console.log('--------------------');
console.log('TESTING BUNDLE');
console.log('--------------------');
console.log();

const content = fs.readFileSync('./dist/main.bundle.js');
if (content.toString().match('global.SENTRY_RELEASE.id = "1.0.0-dev"')) {
  console.log('Saul Goodman, found SENTRY_RELEASE in bundle');
  process.exit(0);
} else {
  console.error('Boom, did not find SENTRY_RELEASE in bundle');
  process.exit(1);
}
