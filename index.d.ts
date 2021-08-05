import { Compiler, WebpackPluginInstance } from 'webpack';
import {
  SentryCliCommitsOptions,
  SentryCliNewDeployOptions,
  SentryCliOptions,
  SentryCliUploadSourceMapsOptions,
  SourceMapsPathDescriptor,
} from '@sentry/cli';

export interface SentryCliPluginOptions
  extends Pick<
      SentryCliOptions,
      'url' | 'authToken' | 'org' | 'project' | 'vscRemote' | 'dist' | 'silent'
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
   * when Cli error occurs, plugin calls this function.
   * webpack compilation failure can be chosen by calling invokeErr callback or not.
   * defaults to `(err, invokeErr) => { invokeErr() }`
   */
  errorHandler?: (err: Error, invokeErr: () => void) => void;

  /**
   * Adds commits to sentry
   */
  setCommits?: SentryCliCommitsOptions;

  /**
   * Creates a new release deployment
   */
  deploy?: SentryCliNewDeployOptions;
}

declare class SentryCliPlugin implements WebpackPluginInstance {
  constructor(options: SentryCliPluginOptions);
  apply(compiler: Compiler): void;
}

export default SentryCliPlugin;
