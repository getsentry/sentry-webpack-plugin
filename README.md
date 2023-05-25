<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Moved!

> ⚠️ Notice: The repository for the `@sentry/webpack-plugin` package moved to
> https://github.com/getsentry/sentry-javascript-bundler-plugins.
>
> Please open any issues and PRs over there, as this repository is no longer
> maintained!

# Sentry Webpack Plugin

A webpack plugin acting as an interface to
[Sentry CLI](https://docs.sentry.io/learn/cli/).

### Installation

`@sentry/webpack-plugin` requires at least `webpack@4.41.31` or any `webpack@5`
version to be installed.

Using npm:

```bash
$ npm install @sentry/webpack-plugin --save-dev
```

Using yarn:

```bash
$ yarn add @sentry/webpack-plugin --dev
```

### CLI Configuration

You can use either `.sentryclirc` file or ENV variables described here
https://docs.sentry.io/cli/configuration.

### Usage

```js
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const config = {
  plugins: [
    new SentryWebpackPlugin({
      include: '.',
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.config.js'],
      configFile: 'sentry.properties',
    }),
  ],
};
```

Also, check the [example](example) directory.

#### Options

| Option             | Type                                                                                | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| include            | `string`/`array`/`object`                                                           | required | One or more paths that Sentry CLI should scan recursively for sources. It will upload all `.map` files and match associated `.js` files. Each path can be given as an object with path-specific options. See [table below](#include) for details.                                                                                                                                                                              |
| org                | `string`                                                                            | optional | The slug of the Sentry organization associated with the app. Can also be specified via `process.env.SENTRY_ORG`.                                                                                                                                                                                                                                                                                                               |
| project            | `string`                                                                            | optional | The slug of the Sentry project associated with the app. Can also be specified via `process.env.SENTRY_PROJECT`.                                                                                                                                                                                                                                                                                                                |
| authToken          | `string`                                                                            | optional | The authentication token to use for all communication with Sentry. Can be obtained from https://sentry.io/settings/account/api/auth-tokens/. Required scopes: `project:releases` (and `org:read` if `setCommits` option is used).                                                                                                                                                                                              |
| url                | `string`                                                                            | optional | The base URL of your Sentry instance. Defaults to https://sentry.io/, which is the correct value for SAAS customers.                                                                                                                                                                                                                                                                                                           |
| customHeader       | `string`                                                                            | optional | A header added to all outgoing requests. A string in the format `header-key: header-value`                                                                                                                                                                                                                                                                                                                                     |
| vcsRemote          | `string`                                                                            | optional | The name of the remote in the version control system. Defaults to `origin`.                                                                                                                                                                                                                                                                                                                                                    |
| release            | `string`                                                                            | optional | Unique identifier for the release. Can also be specified via `process.env.SENTRY_RELEASE`. Defaults to the output of the `sentry-cli releases propose-version` command, which automatically detects values for Cordova, Heroku, AWS CodeBuild, CircleCI, Xcode, and Gradle, and otherwise uses `HEAD`'s commit SHA. (**For `HEAD` option, requires access to `git` CLI and for the root directory to be a valid repository**). |
| dist               | `string`                                                                            | optional | Unique identifier for the distribution, used to further segment your release. Usually your build number.                                                                                                                                                                                                                                                                                                                       |
| entries            | `array`/`RegExp`/`function(key: string): bool`                                      | optional | Filter for entry points that should be processed. By default, the release will be injected into all entry points.                                                                                                                                                                                                                                                                                                              |
| ignoreFile         | `string`                                                                            | optional | Path to a file containing list of files/directories to ignore. Can point to `.gitignore` or anything with the same format.                                                                                                                                                                                                                                                                                                     |
| ignore             | `string`/`array`                                                                    | optional | One or more paths to ignore during upload. Overrides entries in `ignoreFile` file. If neither `ignoreFile` nor `ignore` is present, defaults to `['node_modules']`.                                                                                                                                                                                                                                                            |
| configFile         | `string`                                                                            | optional | Path to Sentry CLI config properties, as described in https://docs.sentry.io/product/cli/configuration/#configuration-file. By default, the config file is looked for upwards from the current path, and defaults from `~/.sentryclirc` are always loaded                                                                                                                                                                      |
| ext                | `array`                                                                             | optional | The file extensions to be considered. By default the following file extensions are processed: `js`, `map`, `jsbundle`, and `bundle`.                                                                                                                                                                                                                                                                                           |
| urlPrefix          | `string`                                                                            | optional | URL prefix to add to the beginning of all filenames. Defaults to `~/` but you might want to set this to the full URL. This is also useful if your files are stored in a sub folder. eg: `url-prefix '~/static/js'`.                                                                                                                                                                                                            |
| urlSuffix          | `string`                                                                            | optional | URL suffix to add to the end of all filenames. Useful for appending query parameters.                                                                                                                                                                                                                                                                                                                                          |
| validate           | `boolean`                                                                           | optional | When `true`, attempts source map validation before upload if rewriting is not enabled. It will spot a variety of issues with source maps and cancel the upload if any are found. Defaults to `false` to prevent false positives canceling upload.                                                                                                                                                                              |
| stripPrefix        | `array`                                                                             | optional | When paired with `rewrite`, will remove a prefix from filename references inside of sourcemaps. Useful for removing a path that is build-machine-specific. Note that this will NOT change the names of uploaded files.                                                                                                                                                                                                         |
| stripCommonPrefix  | `boolean`                                                                           | optional | When paired with `rewrite`, will add `~` to the `stripPrefix` array. Defaults to `false`.                                                                                                                                                                                                                                                                                                                                      |
| sourceMapReference | `boolean`                                                                           | optional | Determines whether sentry-cli should attempt to link minified files with their corresponding maps. By default, it will match files and maps based on name, and add a `Sourcemap` header to each minified file for which it finds a map. Can be disabled if all minified files contain `sourceMappingURL`. Defaults to `true`.                                                                                                  |
| rewrite            | `boolean`                                                                           | optional | Enables rewriting of matching source maps so that indexed maps are flattened and missing sources are inlined if possible. Defaults to `true`                                                                                                                                                                                                                                                                                   |
| finalize           | `boolean`                                                                           | optional | Determines whether Sentry release record should be automatically finalized (`date_released` timestamp added) after artifact upload. Defaults to `true`                                                                                                                                                                                                                                                                         |
| dryRun             | `boolean`                                                                           | optional | Attempts a dry run (useful for dev environments). Defaults to `false`, but may be automatically set to true in development environments by some framework integrations (Next.JS, possibly others).                                                                                                                                                                                                                             |
| debug              | `boolean`                                                                           | optional | Print useful debug information. Defaults to `false`.                                                                                                                                                                                                                                                                                                                                                                           |
| silent             | `boolean`                                                                           | optional | Suppresses all logs (useful for `--json` option). Defaults to `false`.                                                                                                                                                                                                                                                                                                                                                         |
| cleanArtifacts     | `boolean`                                                                           | optional | Remove all the artifacts in the release before the upload. Defaults to `false`.                                                                                                                                                                                                                                                                                                                                                |
| errorHandler       | `function(err: Error, invokeErr: function(): void, compilation: Compilation): void` | optional | Function to call a when CLI error occurs. Webpack compilation failure can be triggered by calling `invokeErr` callback. Can emit a warning rather than an error (allowing compilation to continue) by setting this to `(err, invokeErr, compilation) => { compilation.warnings.push('Sentry CLI Plugin: ' + err.message) }`. Defaults to `(err, invokeErr) => { invokeErr() }`.                                                |
| setCommits         | `Object`                                                                            | optional | Adds commits to Sentry. See [table below](#optionssetcommits) for details.                                                                                                                                                                                                                                                                                                                                                     |
| deploy             | `Object`                                                                            | optional | Creates a new release deployment in Sentry. See [table below](#deploy) for details.                                                                                                                                                                                                                                                                                                                                            |

#### <a name="include"></a>options.include:

| Option             | Type             | Required | Description                                    |
| ------------------ | ---------------- | -------- | ---------------------------------------------- |
| paths              | `array`          | required | One or more paths to scan for files to upload. |
| ignoreFile         | `string`         | optional | See above.                                     |
| ignore             | `string`/`array` | optional | See above.                                     |
| ext                | `array`          | optional | See above.                                     |
| urlPrefix          | `string`         | optional | See above.                                     |
| urlSuffix          | `string`         | optional | See above.                                     |
| stripPrefix        | `array`          | optional | See above.                                     |
| stripCommonPrefix  | `boolean`        | optional | See above.                                     |
| sourceMapReference | `boolean`        | optional | See above.                                     |
| rewrite            | `boolean`        | optional | See above.                                     |

Example:

```js
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const config = {
  plugins: [
    new SentryWebpackPlugin({
      include: [
        {
          paths: ['./packages'],
          urlPrefix: '~/path/to/packages',
        },
        {
          paths: ['./client'],
          urlPrefix: '~/path/to/client',
        },
      ],
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.config.js'],
      configFile: 'sentry.properties',
    }),
  ],
};
```

#### <a name="setCommits"></a>options.setCommits:

| Option         | Type      | Required  | Description                                                                                                                                                                                                              |
| -------------- | --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| repo           | `string`  | see notes | The full git repo name as defined in Sentry. Required if `auto` option is not `true`, otherwise optional.                                                                                                                |
| commit         | `string`  | see notes | The current (most recent) commit in the release. Required if `auto` option is not `true`, otherwise optional.                                                                                                            |
| previousCommit | `string`  | optional  | The last commit of the previous release. Defaults to the most recent commit of the previous release in Sentry, or if no previous release is found, 10 commits back from `commit`.                                        |
| auto           | `boolean` | optional  | Automatically set `commit` and `previousCommit`. Defaults `commit` to `HEAD` and `previousCommit` as described above. Overrides other options                                                                            |
| ignoreMissing  | `boolean` | optional  | When the flag is set and the previous release commit was not found in the repository, will create a release with the default commits count (or the one specified with `--initial-depth`) instead of failing the command. |

#### <a name="deploy"></a>options.deploy:

| Option   | Type     | Required | Description                                                                      |
| -------- | -------- | -------- | -------------------------------------------------------------------------------- |
| env      | `string` | required | Environment value for the release, for example `production` or `staging`.        |
| started  | `number` | optional | UNIX timestamp for deployment start.                                             |
| finished | `number` | optional | UNIX timestamp for deployment finish.                                            |
| time     | `number` | optional | Deployment duration in seconds. Can be used instead of `started` and `finished`. |
| name     | `string` | optional | Human-readable name for this deployment.                                         |
| url      | `string` | optional | URL that points to the deployment.                                               |

You can find more information about these options in our official docs:
https://docs.sentry.io/product/cli/releases/#sentry-cli-sourcemaps.
