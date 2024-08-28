const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

module.exports = (app) => {
  /**
   * Webpack uses express 4.x. express.BodyParser() no longer exists. Use body-parser. Required for developing advanced mock Rest services.
   */
  app.use(bodyParser.json());

  /**
   * for running tests
   */
  app.use('/mocha.css', express.static(path.join(__dirname, '../node_modules/mocha/mocha.css')));
  app.use('/mocha.js', express.static(path.join(__dirname, '../node_modules/mocha/mocha.js')));
};
