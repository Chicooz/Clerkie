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



/**
 * Methods
 */

RecurringTransactionSchema.methods = {

  
};

/**
 * Statics
 */

RecurringTransactionSchema.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function (options, cb) {
    options.select = options.select || '';
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @api private
   */

  list: function (options, cb) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const sort = options.sort || {};
    const limit = options.limit || 30;
    const select = options.select || '+__v';
    this.find(criteria)
      .sort(sort)
      .limit(limit)
      .select(select)
      .skip(limit * page)
      .exec(cb);
  }
};

mongoose.model('RecurringTransaction', RecurringTransactionSchema);
