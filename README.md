# Sentry CLI Webpack Plugin

A webpack plugin acting as an interface to [Sentry CLI](https://docs.sentry.io/learn/cli/).

### Installation

Using npm:

```
$ npm install sentry-cli-webpack-plugin
```

Using yarn:

```
$ yarn add sentry-cli-webpack-plugin
```

### CLI Configuration

You can use either `.sentryclirc` file or ENV variables described here https://docs.sentry.io/learn/cli/configuration/

### Usage

```js
const SentryCliPlugin = require('sentry-cli-webpack-plugin')

const config = {
 plugins: [
   new SentryCliPlugin({
     release: function (hash) {
        return 'Release #' + hash.slice(0, 5)
     },
     paths: 'dist'
   })
 ]
}
```

#### Options

* `release [required]` - unique name of a release, can be either a `string` or a `function` which will expose you a compilation hash as it's first argument, which is 20-char long string, unique for a given codebase
* `paths [required]` - a `string` or an `array` of paths describing where Sentry CLI should look for source maps and source files. It'll look recursively for all files with `.map` extension and match appropriate `.js` files to them itself

