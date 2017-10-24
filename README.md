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
     include: '.',
     ignoreFile: '.sentrycliignore',
     ignore: ['node_modules', 'webpack.config.js'],
     configFile: '~/.env/my-project/sentrycli.properties'
   })
 ]
}
```

#### Options

* `release [required]` - unique name of a release, can be either a `string` or a `function` which will expose you a compilation hash as it's first argument, which is 20-char long string, unique for a given codebase
* `include [required]` - `string` or `array`, one or more paths that Sentry CLI should scan recursively for sources. It will upload all `.map` files and match associated `.js` files
* `ignoreFile [optional]` - `string`, path to a file containing list of files/directories to ignore. Can point to `.gitignore` or anything with same format
* `ignore [optional]` - `string` or `array`, one or more paths to ignore during upload. Overrides entries in `ignoreFile` file. If neither `ignoreFile` or `ignore` are present, defaults to `['node_modules']`
* `configFile [optional]` - `string`, path to Sentry CLI config properties, as described in https://docs.sentry.io/learn/cli/configuration/#properties-files. By default, the config file is looked for upwards from the current path and defaults from `~/.sentryclirc` are always loaded
