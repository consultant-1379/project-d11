const path = require('path');

module.exports = {
  entry: './test/webpackEntry.js',
  output: {
    path: path.resolve(__dirname, 'test'),
    filename: 'tests.js',
  },
  mode: 'development',
  devServer: {
    contentBase: [
      path.join(__dirname, 'test'),
      path.join(__dirname, 'client', 'libs'),
    ],
    before: require('./test/mock-server-test'),
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'client/apps'),
          path.resolve(__dirname, 'client/components'),
          path.resolve(__dirname, 'client/panels'),
          path.resolve(__dirname, 'client/plugins'),
        ],
        loader: 'babel-loader',
        options: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
          ],
        },
      },
      {
        test: /\.(html)/,
        use: [{
          loader: 'raw-loader',
          options: {
            esModule: true,
          },
        }],
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};
