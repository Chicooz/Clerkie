'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,

  TransactionSchema = new Schema({
    trans_id:{type:String, default:''},
    user_id:{type:String, default:''},
    name:{type:String, default:''},
    amount:Number,
    date:{type:Date},
    dateCreated:{type:Date, default:Date.now},
    dateUpdated:{type:Date}
  });



/**
 * Pre-save hook
 */

TransactionSchema.pre('save', function (next) {
  next();
});



mongoose.model('Transaction', TransactionSchema);
