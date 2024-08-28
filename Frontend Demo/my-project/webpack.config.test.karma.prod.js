const path = require('path');

module.exports = {
  mode: 'none',
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
        test: /\.js$/,
        exclude: /node_modules|test|\-test\.js$/,
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true },
        enforce: 'post',
      },
      {
        test: /\.(html)/,
        use: {
          loader: 'raw-loader',
          options: {
            esModule: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};
