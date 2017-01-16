"use strict";

var redis = require('./RedisConfig.js');

module.exports = {
		'get' : function(key, cb){
			redis.get(key, cb);
		},'put' : function(key, value, cb, expireTime){
			redis.set(key, value, function(err, data){
				if(err){
					cb(err);
				}
				if(!!expireTime){
					return redis.EXPIRE(key, expireTime, cb);
				}
				cb(null, data);					
			});
		},'has' : function(key, cb){
			redis.get(key,cb);
		},'del' :  function(key, cb){
			redis.del(key,cb);
		},'update' : function(key,value, cb){
			redis.getset(key,value, cb);
		},'mput' : function(basekey, objectKey, objectValue, cb){
			redis.HMSET(basekey, objectKey, objectValue, function (err, res) {
				cb(err, res);
			});  
		},'mget' : function(basekey, objectKey, cb){
			redis.hget(basekey, objectKey, function (err, res) {
				cb(err, res);
			});  
		}
		
};
