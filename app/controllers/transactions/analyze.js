const Helper = require('../../helpers/transactions'),
	async = require('async'),
	config = require('../../../config');

module.exports = function(req,res,next){
	var data = req.body.length? req.body : config.demoData;
	async.forEach(data, Helper.scanTransaction, next);
}