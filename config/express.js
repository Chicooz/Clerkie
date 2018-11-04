const express = require('express'),
 compression = require('compression'),
 morgan = require('morgan'),
 
 bodyParser = require('body-parser'),
 methodOverride = require('method-override'),
 cors = require('cors'),
 config = require('./'),
 winston = require('winston'),
 pkg = require('../package.json');

const env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app) {

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  app.use(cors());

  // Static files middleware
  //app.use(express.static(config.root + '/public'));

  // Use winston on production
  let log = 'dev';
  if (env !== 'development') {
    log = {
      stream: {
        write: message => winston.info(message)
      }
    };
  }

  // Don't log duringj tests
  // Logging middleware
  if (env !== 'test') app.use(morgan(log));


  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride
  app.use(bodyParser.json({limit: '150mb'}));
  app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

  app.use(methodOverride(function (req) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));



  if (env === 'development') {
    app.locals.pretty = true;
  }
};