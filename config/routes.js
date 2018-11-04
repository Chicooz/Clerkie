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
    // set timeout
    req.setTimeout(10 * 1000/*milliseconds*/);
    console.log(req.body, 'body')
    console.log(req.query, 'query')
    next();
  });


  app.post('/', transactions.create, transactions.analyze, function(req,res){
    res.send('done')
  })
//  app.get('/', transactions.show)


};
