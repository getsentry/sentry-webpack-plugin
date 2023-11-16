# Changelog

- "Would I rather be feared or loved? Easy. Both. I want people to be afraid of
  how much they love me." — Michael Scott

## 1.21.0

- feat: Add function to download CLI binary (#456)

## 1.20.1

- fix: Update Webpack plugin to 1.75.1 to fix bug in Angular source maps (#439)
- fix: Update @sentry/cli to 1.75.0 to fix ansi-regex security warning (#427)
- build(deps): bump loader-utils from 1.1.0 to 1.4.1 in /example

## 1.20.0

- build: Bump `@sentry/cli` version to `1.74.6` (#406)
- feat: Add a means to detect if the CLI binary exists (#402)
- feat: Add pipeline argument (#403)

## 1.19.1

- fix(deps): Add `webpack-sources` dependency (#397)

## 1.19.0

- feat(config): Support reading release from environment (#389)
- docs: Add example to `options.include` (#384)

## 1.18.9

- ref: Update sentry-cli to latest v1 version and refresh GH actions (#368) by
  @kamilogorek
- docs: Update dryRun documentation to reflect auto-configuration. (#366) by
  @fiveable-jferg

## 1.18.8

- deps: Bump sentry-cli to 1.73.0 (#356) by @kamilogorek

## 1.18.7

- deps: Remove webpack from peerDep and move info about ver to readme (#354) by
  @kamilogorek
- misc: Correct 1.18.6 changelog (#353) by @kamilogorek

## 1.18.6

- ci: Change changelogPolicy to auto for Craft releases (#351)
- deps: Mark Webpack as optional peerDependency via peerDependenciesMeta ( #350)

## v1.18.5

- fix: Check if `rawSource` is available before use (#347)
- deps: Add Webpack as a peerDependency (#343)

## v1.18.4

- deps: Bump sentry-cli to 1.72.0
- ref: Use `var` instead of `const` for module loader for ES5-compat (#338)

## v1.18.3

- types: Fix typo in vcsRemote config option (#327)
- deps: Bump sentry-cli to 1.70.1 (#327)

## v1.18.2

- deps: Update sentry-cli to v1.70

## v1.18.1

- fix: Reexport `SourceMapsPathDescriptor` type (#323)

## v1.18.0

- feat: Add support for multiple apps using Webpack Module Federation (#307)

## v1.17.3

- fix: Switch compilation type in error handler to `unknown` (#322)

## v1.17.2

- docs: Fix description and default value for sourceMapReferences (#318)
- fix: Increase stack size of errors in CI (#319)
- fix: Enable plugin to be imported under ES6 (#316)
- fix: Add `options` to main plugin type (#314)
- fix: Update types of SentryCliPluginOptions.errorHandler (#308)

## v1.17.1

- fix: Fix types and array normalization for `include` option (#302)

## v1.17.0

- feat: Allow `include` option to be an object (#299)
- deps: Update sentry-cli to v1.68 (#297)

## v1.16.0

- feat: Add `ignoreMissing` sub-option to `setCommits` option (#281)
- fix: Add missing `dist` option to `SentryCliPluginOptions` type (#285)
- deps: Update sentry-cli to v1.67

## v1.15.1

- deps: Update sentry-cli to v1.64

## v1.15.0

- feat: Add `cleanAftifacts` option to remove all previously uploaded files in a
  release (#264)
- feat: Add `runOnce` option to allow for skipping multiple uploads with the
  same config (#270)

## v1.14.2

- deps: Update sentry-cli to v1.63 for ARM support

## v1.14.1

- fix: Use `WebpackPluginInstance` type for Webpack v4 and v5 compatibility
  (#259)

## v1.14.0

- feat: Add support for Webpack 5 entry descriptors (#241)

## v1.13.0

- feat: Support minimal CLI options (#225)
- fix: Return an actual error for propagation (#224)
- deps: Bump sentry-cli to `1.58.0`

## v1.12.1

- fix(deploy): change deploy to newDeploy in mocked CLI object (#206)
- fix(types): add deploy configuration to type definitions (#208)

## v1.12.0

- feat: Allow to perform release deploys (#192)
- fix: CJS/TS Exports Interop (#190)
- fix: make setCommits.repo type optional (#200)
- deps: Bump sentry-cli to `1.55.0`

## v1.11.1

- meta: Bump sentry-cli to `1.52.3` which fixes output handlers

## v1.11.0

**This release sets `node.engine: >=8` which makes it incompatible with Node
v6** If you need to support Node v6, please pin your dependency to `1.10.0` and
use selective version resolution:
https://classic.yarnpkg.com/en/docs/selective-version-resolutions/

- meta: Bump sentry-cli to `1.52.2`
- meta: Drop support for `node v6` due to new `sentry-cli` requiring `node >=8`
- chore: Fix setCommits types (#169)

## v1.10.0

- feat: Allow for skiping release finalization (#157)
- fix: Ensure afterEmit hook exists (#165)
- chore: Update TS definitions (#168)

## v1.9.3

- chore: Bump sentry-cli to `1.49.0`
- fix: Dont fail compilation if there is no release available (#155)
- fix: Update auto/repo logic for `setCommit` option (#156)

## v1.9.2

- chore: Resolve Snyk as dependency issues (#152)

## v1.9.1

- ref: Allow for nested setCommits (#142)
- fix: Fixed TS definitions export error (#145)

## v1.9.0

- feat: Add `setCommits` options (#139)
- chore: Add `TypeScript` definition file (#137)
- meta: Bump sentry-cli to `1.48.0`

## v1.8.1

- meta: Bump sentry-cli to `1.47.1`

## v1.8.0

- feat: Add errorHandler option (#133)

## v1.7.0

- feat: Add silent option to disable all output to stdout (#127)

## v1.6.2

- fix: Extract loader name in more reliable way
- build: Craft integration

## v1.6.1

- https://github.com/getsentry/sentry-webpack-plugin/releases
