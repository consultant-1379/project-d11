module.exports = (config) => {
  const karmaConfig = {
    basePath: '',
    hostname: 'localhost',
    listenAddress: 'localhost',
    port: 9876,
    colors: true,
    singleRun: false,
    autoWatch: true,
    frameworks: ['mocha'],
    browsers: ['ChromeDev', 'Firefox'],
    customLaunchers: {
      ChromeDev: {
        base: 'Chrome',
        flags: [
          '--disable-gpu',
          '--disable-translate',
          '--disable-extensions',
        ],
      },
    },
    files: [
      'client/libs/**',
      'test/webpackEntry.js',
    ],
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-webpack',
      'karma-mocha-reporter',
    ],
    preprocessors: {
      './test/webpackEntry.js': ['webpack'],
    },
    webpack: require('./webpack.config.test.karma.dev.js'),
    webpackMiddleware: {
      stats: 'errors-only',
    },
    reporters: ['mocha'],
    mochaReporter: {
      divider: '-',
      showDiff: true,
      output: 'autowatch',
    },
  };

  config.set(karmaConfig);
};
