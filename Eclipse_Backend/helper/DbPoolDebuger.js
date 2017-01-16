/**
 * 
 */

var cache = require("service/cache").local;

module.exports.put = function(req, connection){
	var poolDebug = cache.get("poolDebug");
	
	if(!poolDebug){
		poolDebug = {};
		cache.put("poolDebug", poolDebug);
	}
	
	var json = {
			url : req.tempUrl ? req.tempUrl : req.url,
			databaseName : connection.database,
	}
	
	poolDebug[connection.threadId]=json;
	
}

module.exports.remove = function(connection){
	var poolDebug = cache.get("poolDebug");
	if(poolDebug)
		delete poolDebug[connection.threadId];
}