    const mongose = require("mongoose"),
 	demoData = require('../../../config').demoData,
    RecurringTransaction = mongose.model("RecurringTransaction");


    module.exports = function(req,res){
    	RecurringTransaction.find().populate('transactions').exec(function(err,recurring){
    		if(err){
    			res.status(500).jsonp(err);
    		}else{
    			res.jsonp(recurring)
    		}
    	})
    } 