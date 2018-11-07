'use strict';

/*
 * Module dependencies.
 */
const  config = require('./')
,  transactions = require('../app/controllers/transactions');



/**
 * Expose routes
 */
module.exports = function (app) {

 app.use(function(req,res,next){
    // set timeout 10 seconds as required in challenge.
    req.setTimeout(10 * 1000/*milliseconds*/);
    next();
  });


  app.post('/', transactions.analyze, transactions.get)
  app.get('/',  transactions.get)
};
