    const mongose = require("mongoose"),
    async= require('async'),
    percentage = require("../../config").percentage,
    recurringDateLimit = require("../../config").recurringDateLimit,
    Transaction = mongose.model("Transaction"),
    RecurringTransaction = mongose.model("RecurringTransaction");




exports.scanTransactions = function(transactions,cb){
    const matchTransactions = function(transactionId, cb){
        // amount percentage calculation
        let processed = false;
        async.auto({
            transaction:function(cb){
                Transaction.findOne({_id:transactionId}).exec(cb);
            },
            matches:['transaction',function(results,cb){
                const transaction = results.transaction
                , gt = transaction.amount > 0 ? (transaction.amount * (100-percentage))/100 : (transaction.amount * (100+percentage))/100
                , lt = transaction.amount > 0 ? (transaction.amount * (100+percentage))/100 : (transaction.amount * (100-percentage))/100;

                // match againest known transactions
                RecurringTransaction.find({user_id:transaction.user_id, next_amt:{$gte:gt, $lte:lt}}).sort({date:1}).exec(cb);      
            }],
            add:['matches', function(results,cb){
                const transaction = results.transaction;
                if(results.matches.length){
                    // filter recurring that match vendor and expected date 
                    const matchedRecurring = results.matches.filter(function(o){
                        return matchVendors(transaction.name, o.name)  && matchApproximateInterval(new Date(transaction.date), o.next_date );
                    });
                    var match = matchedRecurring.length ? matchedRecurring[0] : null;
                        if(match){
                            processed = true;
                            match.transactions.addToSet(results.transaction);
                            match.name = transaction.name;
                            match.next_date = getNextDate(transaction.date, match.interval);
                            return match.save(cb);                            
                        }else{
                            cb();
                        }
                }else{
                    cb()
                }
            }],
            new:['add', function(results,cb){
                const transaction = results.transaction                
                , gt = transaction.amount > 0 ? (transaction.amount * (100-percentage))/100 : (transaction.amount * (100+percentage))/100
                , lt = transaction.amount > 0 ? (transaction.amount * (100+percentage))/100 : (transaction.amount * (100-percentage))/100;
                if(!processed){
                    // transaction didnt pass previously known recurring transactions, check for 2 more similar transactions in the same interval
                    Transaction.find({ user_id: transaction.user_id, amount:{'$gte':gt, '$lte':lt}}).sort({date:1}).exec(function (err, transactions) {
                        if(err){
                            return cb(err);
                        }
                        if(transactions.length >2){
                            var filtered = transactions.filter(function(trans){
                                return matchVendors(transaction.name, trans.name)  && transaction.trans_id !== trans.trans_id;
                            })
                            if(filtered.length > 2){
                                // found 3 or more matched transactions, send to match and process
                                let matched = matchInterval(results.transaction, filtered, cb);
                            }else{
                            // if not enough matched then nothing to report
                                cb();
                            }
                        }else{
                            // if not enough found then nothing to report
                         cb();   
                        }
                    });
                }else{
                    // already processed as recurring
                    cb();
                }
            }]
        }, cb);
    };
    // 1- sort new transactions by date old -> new 
    transactions.sort((a, b) => a.date >= b.date);
    // 2- process one transaction at the time 
    async.forEachLimit(transactions,1, function(transaction, cb){         
        
        Transaction.update({trans_id:transaction.trans_id, user_id:transaction.user_id}, transaction, {upsert:true}, function(err,upsert){
            if(upsert.upserted){
                // new transaction 
                return matchTransactions(upsert.upserted[0]._id,  cb);
            }else{
                // transaction is duplicate no need to reprocess
                return cb();
            }
        });
    }, cb);
}
function getNextDate(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
const createNewRecurring = function( filtered, cb){
    filtered.save(cb);
}

const matchInterval = function(transaction, filtered, cb){
    let interval = 0;
    filtered.sort((a, b) => a.date <= b.date);
    const transactions = [transaction];// matching scanning element
    for(let i=0; i< filtered.length; i++){
        if(interval){
            if(matchApproximateInterval(getNextDate(new Date( filtered[i].date),interval), new Date(filtered[i-1].date) )){
                transactions.push(filtered[i]);
            }
        }else{
            interval = dateDiff.inDays(filtered[i].date, new Date(transaction.date)); 
            transactions.push(filtered[i]);
        }
        if(i+1 == filtered.length){
            if(transactions.length > 2){
                return createNewRecurring(new RecurringTransaction({
                    name: transaction.name,
                    user_id: transaction.user_id,
                    next_amt: transaction.amount,
                    next_date: getNextDate(transaction.date, interval),
                    transactions: transactions,
                    interval:interval
                }), cb);
            }else{
                return cb();
            }
        }
    }
}

const matchApproximateInterval = function(d1,d2, interval=0){
    const diff = dateDiff.inDays(d1, d2) - interval;
    return diff < recurringDateLimit;
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
