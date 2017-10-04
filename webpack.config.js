var path = require('path');
var SentryPlugin = require('sentry-cli-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new SentryPlugin({
      release: +new Date(),
      paths: ['dist']
    })
  ]
};
