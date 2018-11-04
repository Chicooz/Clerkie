
/**
 * Module dependencies.
 */
const  async = require('async'),
  url = require('url'),
  mongoose = require('mongoose'),
  Influencer = mongoose.model('Influencer'),
  crypto = require('crypto'),
  config = require('./'),
  Apps = config.Apps,
  crypt = function(callback){
    crypto.randomBytes(20, function(err, buffer) {
      var token = buffer.toString('hex');
      callback(err,token)
    });
  };



// grant functions

function grant(username, password,  done) {
  var options = {
    criteria: { blurCode:username}
  };
  Influencer.findOne(options.criteria, function (err, user) {
    if (err) return done(err)
    if (!user) {
      return done(null, false, { message: 'Unknown user' });
    }
    if(!password){
      return done(null,user)
    }
    if (!user.authenticate(password)) {
      return done(null, false, { message: 'Invalid password' });
    }

    return done(null, user);
  });
}

var grantUser = function(username, password, done){
  return grant(username, password, done );
}

var grantClient = function(username, password, done){
  const index = Apps.usernames.indexOf(username);
  if(~index){
    if(!password){
      return done(null, {username:username, password:password});
    }
    if(Apps.passwords[index] == password){
      return done(null, {username:username, password:password});
    }else{
      return done(null, false, { message: 'Wrong Password' });
    }
  }else{
    return done(null, false, { message: 'Unknown clientId' });
  }
}

exports.getClient = grantClient;
exports.grantTypeAllowed = grantTypeAllowed;
exports.getUser = grantUser;
exports.disgrant = disgrant;

function grantTypeAllowed(clientId, grantType, callback){
  callback(null, grantType === 'password');
}
function disgrant(req,res){
  
  Influencer.update({accessToken:req.oauth.bearerToken.id},{accessToken:null,clientId:null,expires:null}, function(err, reply) {
    //console.log(reply)
    if (err) {
      return res.status(500).jsonp({error:err,message:err.toString()})
    }
    res.jsonp({})
  });

  /*
  client.del(req.oauth.bearerToken.id, function(err, reply) {
    console.log(reply)
    if (err) {
      return res.status(500).jsonp({error:err,message:err.toString()})
      
    }
    res.jsonp({})
  });
  */
   
}

exports.saveAccessToken = saveAccessToken;

function saveAccessToken(accessToken, clientId, expires, user, callback){
  //console.log(accessToken,clientId,expires,user,'saveAccessToken')
  Influencer.update({_id:user._id},{accessToken:accessToken,expires:expires}, callback);
}


exports.getAccessToken = getAccessToken;

/**
 * Session
 */

exports.session = newlogin;

function getAccessToken(bearerToken, done){
  Influencer.findOne({accessToken:bearerToken}, function(err, user) {
    if (err) {
      return done(null, false, { message: err.toString() });
    }
    if(!user){
      return done(null, false, {message:'unknown accessToken'})
    }
    return done(null, {
        id:bearerToken,
        clientId:null,
        expires: new Date().setDate(new Date().getDate()+3),
        user:user
      });
  });
}

exports.refreshToken = function(req,res){
    createToken( function(err,token,expire){
      if(err) return res.status(500).jsonp({
        error:err,
        message:err.toString()
      });
      saveAccessToken(token, req.oauth.bearerToken.clientId, expire, req.oauth.bearerToken.user, function(err){
        if(err) {
          return res.status(500).jsonp({
              error:err,
              message:err.toString()
          });
        }
        return res.jsonp({token_type:'bearer', access_token:token, expires_in: 15*60*60*24  });
      });
    });    
}

function createToken(cb){ 
  crypt(function(err,t){
      token = t;
      tokenexpiry = new Date();
      tokenexpiry.setDate(tokenexpiry.getDate()+15);
      cb(err,token,tokenexpiry);
  });
}
function newlogin(req,res){
  if(req.influencer){
    var user = req.influencer;
    createToken( function(err,token,expire){
      if(err) return res.status(500).jsonp({error:err, message:err.toString()});
      saveAccessToken(token, null, expire, user, function(err){    
        if(err) return res.status(500).jsonp({error:err, message:err.toString()});
        return res.jsonp({ access_token:token, expires_in: 15*60*60*24 , user_id: user._id});
      })
    })
  }else{
    return res.status(500).jsonp({error:'login error'})
  }
}


