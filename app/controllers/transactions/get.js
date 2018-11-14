    const mongose = require("mongoose"),
    demoData = require('../../../config').demoData,
 	recurringDateLimit = require('../../../config').recurringDateLimit,
    RecurringTransaction = mongose.model("RecurringTransaction");


    module.exports = function(req,res){
    	RecurringTransaction.find().populate('transactions').exec(function(err,recurring){
    		if(err){
    			res.status(500).jsonp(err);
    		}else{
                const filtered = recurring.filter(function(rec){
                    let day = new Date();
                    day.setDate(day.getDate() + recurringDateLimit);
                    if(rec.next_date >= day){
                        return true;
                    }
                });
    			res.jsonp(filtered);
    		}
    	})
    } 