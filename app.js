'use strict';

/*
 * Blur Bot backend
 * Copyright(c) 2017 texta inc <s.negm@theblurapp.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

//require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
mongoose.Promise = global.Promise;

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 1984;
const app = express();

/**
 * Expose
 */

module.exports = app;

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/express')(app);
require('./config/routes')(app);

connect().then(
  () => { listen(); },
  err => { console.log }
)

function listen () {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

function connect () {
  var options = {  keepAlive: 1,useNewUrlParser:1 };
  return mongoose.connect(config.db, options);
}