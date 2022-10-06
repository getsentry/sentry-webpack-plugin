/* eslint-disable no-console */
const fs = require('fs');
const childProcess = require('child_process');

/**
 * Run the given shell command, piping the shell process's `stdin`, `stdout`, and `stderr` to that of the current
 * process. Returns contents of `stdout`.
 */
function run(cmd, options) {
  return String(childProcess.execSync(cmd, { stdio: 'inherit', ...options }));
}

if (process.env.GITHUB_ACTIONS && process.env.NODE_VERSION === '18') {
  // This is to avoid a `digital envelope routines unsupported` error which
  // crops up when trying to combine Webpack 4 and Node 18, and must be set
  // before webpack runs. See https://stackoverflow.com/a/69699772/.
  process.env.NODE_OPTIONS += ' --openssl-legacy-provider';
}

run('yarn build');

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
