const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const path = require('path');

module.exports = {
  entry: ['./index.js'],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  plugins: [
    new SentryWebpackPlugin({
      include: '.',
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.config.js'],
      configFile: 'sentry.properties',
      dryRun: true,
      release: 'foo',
      project: 'my-project',
      org: 'my-org',
      dist: '123',
    }),
  ],
};
