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



/**
 * Methods
 */

TransactionSchema.methods = {

  
};

/**
 * Statics
 */

TransactionSchema.statics = {

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

mongoose.model('Transaction', TransactionSchema);
