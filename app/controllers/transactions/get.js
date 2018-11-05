    const mongose = require("mongoose"),
    RecurringTransaction = mongose.model("RecurringTransaction");


    module.exports = function(req,res){
    	const user = req.body[0].user_id;
    	RecurringTransaction.find({user_id:user}).populate('transactions').exec(function(err,recurring){
    		if(err){
    			res.status(500).jsonp(err);
    		}else{
    			res.jsonp(recurring)
    		}
    	})
    } 