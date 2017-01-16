"use strict" ;
var logger = require("helper").logger;

var poolMap = {};
function parser(db, poolCluster) {
	var pools = !!db.pools ? db.pools : {};
	for (var poolName in pools) {
		if (pools.hasOwnProperty(poolName)) {
			var singleServer = pools[poolName];
			var singleServerConfig = singleServer.config;//here we got connection configuration
			poolCluster.add(poolName, singleServerConfig);//db.add(pool1,connection configuration)
			for (var dbindex in singleServer.db) {//we get db names in the pool
				if (singleServer.db.hasOwnProperty(dbindex)) {
					var dbName = singleServer.db[dbindex];
					poolMap[dbName] = poolName;
				}
			}	        
	    }
	}
	logger.info("Db cluster pool is ready");
}

exports.parser = parser;
exports.poolMap = poolMap;
