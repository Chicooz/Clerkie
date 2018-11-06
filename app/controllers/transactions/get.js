    const mongose = require("mongoose"),
 	demoData = require('../../../config').demoData,
    RecurringTransaction = mongose.model("RecurringTransaction");


    module.exports = function(req,res){
    	let transactions=req.body;
		if(!transactions || !transactions.length){
		  	transactions = demoData;	
		}
    	const user = transactions[0].user_id;
    	RecurringTransaction.find({user_id:user}).populate('transactions').exec(function(err,recurring){
    		if(err){
    			res.status(500).jsonp(err);
    		}else{
    			res.jsonp(recurring)
    		}
    	})
    } 