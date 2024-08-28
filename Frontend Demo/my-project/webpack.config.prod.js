const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const packageJson = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const targetPackage = path.resolve(__dirname, 'target/package');
const clientRoot = 'client';
const majorVersion = packageJson.version.match(/^\d+/)[0];

const componentsAssets = {};
const copyrightText = fs.readFileSync(path.resolve(__dirname, 'msg.copyright'), 'utf8');
const timestamp = (new Date()).getTime();

const getExternalsEntries = () => {
  const obj = {};
  const externals = require('./externals.config.prod');
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

            const src = path.resolve(__dirname, clientRoot, category, itemPath);
            const dest = path.join(targetPackage, category, itemPath);
            componentsAssets[src] = dest;
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

            const src = path.resolve(__dirname, clientRoot, category, itemPath);
            const dest = path.join(targetPackage, category, itemPath, majorVersion);
            componentsAssets[src] = dest;
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
    filename: '[name].js',
    libraryTarget: 'amd',
    path: targetPackage,
  },
  externals: {
    '@eui/component': 'amd @eui/component',
    '@eui/lit-component': 'amd @eui/lit-component',
    '@eui/panel': 'amd @eui/panel',
    '@eui/app': 'amd @eui/app',
    '@eui/base': 'amd @eui/base',
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      filename: path.resolve(__dirname, 'target/package/index.html'),
      template: path.resolve(__dirname, 'client/index.html'),
      ts: timestamp,
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      hash: true,
      filename: path.resolve(__dirname, 'target/package/login.html'),
      template: path.resolve(__dirname, 'client/login.html'),
      ts: timestamp,
      chunks: [],
    }),
    new webpack.BannerPlugin({
      banner: () => copyrightText.replace('{year}', (new Date()).getFullYear()),
    }),
    new FileManagerPlugin({
      onStart: {
        delete: [targetPackage],
        copy: [
          /**
           * E-UI SDK files
           */
          { source: 'node_modules/@eui/container/*(assets|components|libs|panels|plugins)/**/!(*debug*|*.map)', destination: `${targetPackage}` },
          { source: 'node_modules/@eui/!(container)/!(node_modules)/**/!(*debug*|*.map|README.md|package.json)', destination: `${targetPackage}/libs/@eui` },
          { source: 'node_modules/@eui/theme/0/fonts', destination: `${targetPackage}/assets/fonts` },
        ],
      },
      onEnd: {
        copy: [
          /**
           * apps files
           */
          { source: 'client/apps/**/*.json', destination: `${targetPackage}/apps` },
          { source: 'client/assets/**', destination: `${targetPackage}/assets` },
          { source: 'client/panels/**/*.json', destination: `${targetPackage}/panels` },
          { source: 'client/plugins/**/*.js', destination: `${targetPackage}/plugins` },
          { source: 'client/libs/', destination: `${targetPackage}/libs/` },
          { source: 'client/locale/**/*.json', destination: `${targetPackage}/locale` },
          { source: 'client/config/**/*.{json,js}', destination: `${targetPackage}/config` },
          { source: 'client/!([index|login]*).html', destination: targetPackage },
        ],
        archive: [
          {
            source: 'target',
            destination: `target/${packageJson.name}-${packageJson.version}.tar.gz`,
            format: 'tar',
            options: {
              gzip: true,
              gzipOptions: {
                level: 1,
              },
              globOptions: {
                nomount: true,
              },
            },
          },
        ],
      },
    }),
    {
      apply: (compiler) => {
        const cpx = require('cpx');
        compiler.hooks.afterEmit.tap('CopyAssets', (compilation) => {
          Object.keys(componentsAssets).forEach((key) => {
            cpx.copy(path.join(key, '**/*.json'), path.join(componentsAssets[key]));
          });
        });
      },
    },
  ],
};

const config = {
  mode: 'production',
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
