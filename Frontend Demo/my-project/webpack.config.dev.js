const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const majorVersion = require('./package.json').version.match(/^\d+/)[0];

const clientRoot = 'client';
const timestamp = (new Date()).getTime();

const getExternalsEntries = () => {
  const obj = {};
  const externals = require('./externals.config.dev');
  Object.keys(externals).forEach((category) => {
    const items = externals[category];
    if (category === 'components') {
      Object.keys(items).forEach((categoryItem) => {
        if (categoryItem === 'default') {
          items[categoryItem].forEach((item) => {
            const { path: itemPath, entry } = item;
            const ip = path.join(category, itemPath, 'Main');
            const op = path.resolve(__dirname, clientRoot, category, itemPath, 'src', `${entry}.js`);
            console.log(`[${ip}]: ${op}`);
            obj[ip] = op;
          });
          return;
        }

        if (categoryItem === 'shareable') {
          items[categoryItem].forEach((item) => {
            const { path: itemPath, entry } = item;
            const ip = path.join(category, itemPath, majorVersion, 'Main');
            const op = path.resolve(__dirname, clientRoot, category, itemPath, 'src', `${entry}.js`);
            console.log(`[${ip}]: ${op}`);
            obj[ip] = op;
          });
        }
      });
    } else {
      items.forEach((item) => {
        const { path: itemPath, entry } = item;
        const ip = path.join(category, itemPath, entry);
        const op = path.resolve(__dirname, clientRoot, category, itemPath, 'src', `${entry}.js`);
        console.log(`[${ip}]: ${op}`);
        obj[ip] = op;
      });
    }
  });

  return obj;
};

const externalsConfig = {
  entry: getExternalsEntries(),
  output: {
    path: path.resolve(__dirname, clientRoot),
    filename: '[name].js',
    libraryTarget: 'amd',
  },
  externals: {
    '@eui/component': 'amd @eui/component',
    '@eui/lit-component': 'amd @eui/lit-component',
    '@eui/panel': 'amd @eui/panel',
    '@eui/app': 'amd @eui/app',
    '@eui/base': 'amd @eui/base',
  },
};

const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: [
      path.resolve(__dirname, 'client'),
    ],
    before: require('./dev/mock-server-dev'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      filename: path.resolve(__dirname, 'client/index.html'),
      template: path.resolve(__dirname, 'client/index.html'),
      ts: timestamp,
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: path.resolve(__dirname, 'client/login.html'),
      template: path.resolve(__dirname, 'client/login.html'),
      ts: timestamp,
      chunks: [],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'client/components'),
          path.resolve(__dirname, 'client/panels'),
          path.resolve(__dirname, 'client/plugins'),
          path.resolve(__dirname, 'client/apps'),
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
        use: {
          loader: 'raw-loader',
          options: {
            esModule: true,
          },
        },
        exclude: [
          path.resolve(__dirname, 'client/index.html'),
          path.resolve(__dirname, 'client/login.html'),
        ],
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};

module.exports = () => new Promise((resolve) => {
  const _externalsConfig = Object.assign({}, config, externalsConfig);
  resolve(_externalsConfig);
});
