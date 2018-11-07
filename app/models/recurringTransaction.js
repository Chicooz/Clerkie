'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,

  RecurringTransactionSchema = new Schema({
    name:{type:String, default:''},
    user_id:{type:String, default:''},
    next_amt:Number,
    next_date:{type:Date},
    transactions:[{type:Schema.ObjectId, ref:'Transaction'}],
    interval:Number,
    dateCreated:{type:Date, default:Date.now}
  });



/**
 * Pre-save hook
 */

RecurringTransactionSchema.pre('save', function (next) {
  next();
});




mongoose.model('RecurringTransaction', RecurringTransactionSchema);
