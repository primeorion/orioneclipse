"use strict";
/**
 * This controller is for Dev or Admin, will have function to control/manager app. e.g look at db pool, look at cache,
 *  and reinitiating various application parameters. 
 *  
 */
var app = require("express")();

var _ = require('lodash');

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var cache = require('service/cache');
var localCache = cache.local;
var poolService = require('service/dbpool/PoolService.js');

app.get('/localcache', function(req, res, next){
	var keys = localCache.keys();
	var dataToReturn = {
		memsize : localCache.memsize(),
		size : localCache.size(),
		keys : keys
	};
	var data = {};
	var keysToRemove = ['poolCluster'];
	var status = false;
	for(var index in keys){
		if (keys.hasOwnProperty(index)) {
			status = false;
			var key = keys[index];
			keysToRemove.forEach(function(value){
				if(key === value){
					status = true;
				}
			});
			if(!status){
				data[key] = localCache.get(key);
			}
		}
	}
	dataToReturn.data = data;
	res.json(dataToReturn);
});

app.get('/poolCluster', function(req, res, next){
	res.send(JSON.stringify(_.keys(localCache.get('poolCluster')._nodes)));
});

app.get('/heapdump', function(req, res, next){
	var heapdump = require('heapdump');
	heapdump.writeSnapshot(function(err, filename) {
		res.download(appBasePath + "/" + filename);
	});
});

app.get('/poolDebug', function(req, res, next){
	res.send(localCache.get("poolDebug"));
});

app.post('/temp', function(req, res, next){
	next();
});

/*
 * This will be used in future to reinit pools
 * app.post("/updatePoolCluster", function(req, res){

	var poolName = req.data.poolName;
	var host = req.data.host;
	var user = req.data.user;
	var password = req.data.password;
	var connectionLimit = req.data.connectionLimit;

	var config = {
		host : host,
		user : user,
		password: password,
		connectionLimit : connectionLimit
	};

});*/

module.exports = app;
