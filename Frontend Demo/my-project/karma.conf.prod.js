module.exports = (config) => {
  const karmaConfig = {
    basePath: '',
    hostname: 'localhost',
    listenAddress: 'localhost',
    port: 9876,
    colors: true,
    singleRun: true,
    autoWatch: false,
    frameworks: ['mocha'],
    browsers: ['ChromeHeadless', 'FirefoxProd'],
    customLaunchers: {
      FirefoxProd: {
        base: 'Firefox',
        flags: [
          '--headless',
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
      'karma-coverage-istanbul-reporter',
      'karma-mocha-reporter',
      'karma-junit-reporter',
    ],
    preprocessors: {
      './test/webpackEntry.js': ['webpack'],
    },
    webpack: require('./webpack.config.test.karma.prod.js'),
    webpackMiddleware: {
      stats: 'errors-only',
    },
    reporters: ['coverage-istanbul', 'mocha', 'junit'],
    coverageIstanbulReporter: {
      dir: 'test/coverage',
      reports: ['html'],
      fixWebpackSourcePaths: true,
      combineBrowserReports: true,
    },
    mochaReporter: {
      showDiff: true,
    },
    junitReporter: {
      outputDir: 'test/junit',
    },
  };

  config.set(karmaConfig);
};
