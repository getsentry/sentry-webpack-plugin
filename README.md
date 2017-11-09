<p align="center">
    <a href="https://sentry.io" target="_blank" align="center">
        <img src="https://sentry-brand.storage.googleapis.com/sentry-logo-black.png" width="280">
    </a>
<br/>
    <h1>Sentry CLI Webpack Plugin</h1>
</p>

[![Travis](https://img.shields.io/travis/getsentry/sentry-webpack-plugin.svg?maxAge=2592000)](https://travis-ci.org/getsentry/sentry-webpack-plugin)
[![npm version](https://img.shields.io/npm/v/@sentry/webpack-plugin.svg)](https://www.npmjs.com/package/@sentry/webpack-plugin)
[![npm dm](https://img.shields.io/npm/dm/@sentry/webpack-plugin.svg)](https://www.npmjs.com/package/@sentry/webpack-plugin)
[![npm dt](https://img.shields.io/npm/dt/@sentry/webpack-plugin.svg)](https://www.npmjs.com/package/@sentry/webpack-plugin)

[![deps](https://david-dm.org/getsentry/sentry-webpack-plugin/status.svg)](https://david-dm.org/getsentry/sentry-webpack-plugin?view=list)
[![deps dev](https://david-dm.org/getsentry/sentry-webpack-plugin/dev-status.svg)](https://david-dm.org/getsentry/sentry-webpack-plugin?type=dev&view=list)
[![deps peer](https://david-dm.org/getsentry/sentry-webpack-plugin/peer-status.svg)](https://david-dm.org/getsentry/sentry-webpack-plugin?type=peer&view=list)


A webpack plugin acting as an interface to [Sentry CLI](https://docs.sentry.io/learn/cli/).

### Installation

Using npm:

```
$ npm install @sentry/webpack-plugin
```

Using yarn:

```
$ yarn add @sentry/webpack-plugin
```

### CLI Configuration

You can use either `.sentryclirc` file or ENV variables described here https://docs.sentry.io/learn/cli/configuration/

### Usage

```js
const SentryCliPlugin = require('@sentry/webpack-plugin')

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
