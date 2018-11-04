'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose'),
 async = require('async'),
 demoData = require('../../../config').demoData,
 Transaction = mongoose.model('Transaction');

module.exports = function (req, res, next) {
	let transactions=req.body;
  if(!transactions || !transactions.length){
  	transactions = demoData;	
  //  return next("no transactions found");
  }

  async.forEach(transactions, function(transaction, cb){
    transaction.is_recurring = false;
    Transaction.update({trans_id:transaction.trans_id}, transaction, {upsert:true}, cb);
  }, next);
};