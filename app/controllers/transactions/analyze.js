const Helper = require('../../helpers/transactions'),
	config = require('../../../config');

module.exports = function(req,res,next){
	var data = req.body.length? req.body : config.demoData;
	Helper.scanTransactions(data, next);
}