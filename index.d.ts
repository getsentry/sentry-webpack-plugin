import { Compiler, WebpackPluginInstance } from 'webpack';
import {
  SentryCliCommitsOptions,
  SentryCliNewDeployOptions,
  SentryCliOptions,
  SentryCliUploadSourceMapsOptions,
  SourceMapsPathDescriptor,
} from '@sentry/cli';

declare namespace SentryCliPlugin {
  export interface SentryCliPluginOptions
    extends Pick<
        SentryCliOptions,
        | 'url'
        | 'authToken'
        | 'org'
        | 'project'
        | 'vcsRemote'
        | 'dist'
        | 'silent'
        | 'customHeader'
      >,
      Pick<
        SentryCliUploadSourceMapsOptions,
        | 'ignoreFile'
        | 'rewrite'
        | 'sourceMapReference'
        | 'stripPrefix'
        | 'stripCommonPrefix'
        | 'validate'
        | 'urlPrefix'
        | 'urlSuffix'
        | 'ext'
      > {
    /**
     * Filepaths to scan recursively for source and source map files
     */
    include:
      | string
      | SourceMapsPathDescriptor
      | Array<string | SourceMapsPathDescriptor>;

    /**
     * Filepaths to ignore when scanning for sources and source maps
     */
    ignore?: string | Array<string>;

    /**
     * Unique name of a release, must be a string, should uniquely identify your release,
     * defaults to sentry-cli releases propose-version command which should always return the correct version
     * (requires access to git CLI and root directory to be a valid repository).
     */
    release?: string;

    /**
     * A filter for entry points that should be processed.
     * By default, the release will be injected into all entry points.
     */
    entries?: string[] | RegExp | ((key: string) => boolean);

    /**
     * Path to Sentry CLI config properties, as described in https://docs.sentry.io/learn/cli/configuration/#properties-files.
     * By default, the config file is looked for upwards from the current path and defaults from ~/.sentryclirc are always loaded.
     */
    configFile?: string;

    /**
     * Determines whether processed release should be automatically finalized after artifacts upload.
     * Defaults to `true`.
     */
    finalize?: boolean;

    /**
     * Determines whether plugin should be applied not more than once during whole webpack run.
     * Useful when the process is performing multiple builds using the same config.
     * Defaults to `false`.
     */
    runOnce?: boolean;

    /**
     * Attempts a dry run (useful for dev environments).
     */
    dryRun?: boolean;

    /**
     * Print some useful debug information.
     */
    debug?: boolean;

    /**
     * If true, will remove all previously uploaded artifacts from the configured release.
     */
    cleanArtifacts?: boolean;

    /**
     * When a CLI error occurs, the plugin will call this function.
     *
     * By default, it will call `invokeErr()`, thereby stopping Webpack
     * compilation. To allow compilation to continue and log a warning instead,
     * set this to
     *   (err, invokeErr, compilation) => {
     *     compilation.warnings.push('Sentry CLI Plugin: ' + err.message)
     *   }
     *
     * Note: `compilation` is typed as `unknown` in order to preserve
     * compatibility with both Webpack 4 and Webpack 5 types, If you need the
     * correct type, in Webpack 4 use `compilation.Compilation` and in Webpack 5
     * use `Compilation`.
     */
    errorHandler?: (
      err: Error,
      invokeErr: () => void,
      compilation: unknown
    ) => void;

    /**
     * Adds commits to sentry
     */
    setCommits?: SentryCliCommitsOptions;

    /**
     * Creates a new release deployment
     */
    deploy?: SentryCliNewDeployOptions;
  }

  export { SourceMapsPathDescriptor };
}

declare class SentryCliPlugin implements WebpackPluginInstance {
  options: SentryCliPlugin.SentryCliPluginOptions;
  constructor(options: SentryCliPlugin.SentryCliPluginOptions);
  static cliBinaryExists(): boolean;
  static downloadCliBinary(logger: { log(...args: unknown[]) }): Promise<void>;
  apply(compiler: Compiler): void;
}

// We need to use this older format (over `export default SentryCliPlugin`)
// because we don't want people using the plugin in their TS projects to be
// forced to set `esmoduleinterop` to `true`, which the newer syntax requires.
// See
// https://github.com/microsoft/TypeScript-Website/blob/6a36b3137182084c76cdf133c812fe3a5626dbf0/packages/documentation/copy/en/declaration-files/templates/module.d.ts.md#L95-L106
// (linking to the docs in their raw form on GH rather than on the TS docs site
// in case the docs site ever moves things around).
//
// Note that with this older format, no other top-level exports can exist, which
// is why the exported interface above is wrapped in a namespace. See the
// example in the above link and
// https://github.com/microsoft/TypeScript-Website/blob/6a36b3137182084c76cdf133c812fe3a5626dbf0/packages/documentation/copy/en/declaration-files/templates/module.d.ts.md#L195-L214.
export = SentryCliPlugin;
