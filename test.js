const getNextDate = function(d1,interval){
    
    var d2 =  new Date(d1  + (interval * 24 * 60 * 60 * 1000) )
    console.log(d1,d2);
    return d2;
}
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
var d1 = new Date();


console.log(d1,addDays(d1,24))