module.exports = require('./index').default;

// The assignment to `default` below saves us from having to use
// `esModuleInterop` (which then would force our users to set the same option),
// by manually doing the one part of `esModuleInterop`'s job we actually need.
//
// (In order to avoid a breaking change, we need to stick with default-exporting
// `SentryCliPlugin`. This means that if we want to use ES6 imports (in our own
// use of the plugin), our options are:
//
// `import * as x from y`,
// `import x from y`, and
// `import {default as x} from y`.
//
// If we use the first option, it correctly pulls in the above `module.exports`
// value, but it treats it as a namespace, not a class, and therefore refuses to
// let it be used with `new`. If we use either of the other two, it looks for
// `module.exports.default`, which will be undefined unless either we do (or
// `esModuleInterop` does) the below.)
module.exports.default = module.exports;
