    const mongose = require("mongoose"),
    percentage = require("../../config").percentage
    Transaction = mongose.model("Transaction");


//https://stackoverflow.com/questions/7763327/how-to-calculate-date-difference-in-javascript
// provides dateDiff in dayes, weeks, months and years 
const dateDiff = {
    inDays: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000));
    },

    inWeeks: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000*7));
    },

    inMonths: function(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();

        return (d2M+12*d2Y)-(d1M+12*d1Y);
    },

    inYears: function(d1, d2) {
        return d2.getFullYear()-d1.getFullYear();
    }
}

exports.scanTransaction = function(transaction,cb){
    const gt = transaction.amount > 0 ? (transaction.amount * (100-percentage))/100 : (transaction.amount * (100+percentage))/100;
    const lt = transaction.amount > 0 ? (transaction.amount * (100+percentage))/100 : (transaction.amount * (100-percentage))/100;
    Transaction.find({ user_id: transaction.user_id, amount:{'$gte':gt, '$lte':lt}}).sort({date:1}).exec(function (err, transactions) {
        if(err){
            return cb(err);
        }
        if(transactions.length){
            //console.log(transactions.length, transaction.trans_id)
            var filtered = transactions.filter(function(trans){

                console.log(dateDiff.inDays(new Date(transaction.date),new Date( trans.date)) , '- days -', trans.name)
                return matchVendors(transaction.name, trans.name)
            })
            console.log(filtered.length)

        }else{
            console.log(transaction.name,'NULL')
        }cb();
    });
    
}

const matchVendors = function(vendor1,vendor2){
    if(vendor2 === vendor1){
        return true;
    }
    const arrVen1 = vendor1.split(''),
    arrVen2 = vendor2.split('');
    if(arrVen2.length === arrVen1.length){
        if(arrVen1.length > 1){
            for(i=0;i<arrVen1.slice(-1).length;i++){
                if(arrVen1[i] !== arrVen2[i]){
                    return false;
                }
            }
            return true;
        }
    }else{
        return false;
    }

}