"use strict";

var moduleName = __filename;
// Database configuration
var mysql = require('mysql');
var DaoConfig = require('config').env.prop.orion.db;
var CommunityConfig = DaoConfig.community;
//var multitenancy = require('./Parser.js');
var logger = require("helper/Logger")(moduleName);
var dynamicPool  = require('./DynamicPool');
var poolService = require('service/dbpool/PoolService');
var restoreNodeTimeout = DaoConfig.restoreNodeTimeout ? DaoConfig.restoreNodeTimeout : 10;
var poolCluster = mysql.createPoolCluster({
	restoreNodeTimeout : restoreNodeTimeout
});

/*
 * connectTimeout - creating connection with database, 10000
 * acquireTimeout - acquiring connection from pool, 10000
*/

// decoding password
var decodedPassword = poolService.configurationDecoder({"password": DaoConfig.password}, ['password']);

//logger.debug("\n***************************** \nENcripted Usernname Password : "+JSON.stringify({"password": DaoConfig.password})+"\n*****************************\n" +
//		"Decripted Username Password : "+JSON.stringify(decodedPassword)+"\n*****************************");
poolCluster.add('common', {
   connectionLimit: DaoConfig.connectionLimit ? DaoConfig.connectionLimit : 10,
   host: DaoConfig.host,
   user: DaoConfig.user,
   password: decodedPassword.password, 
   database: DaoConfig.database,
});

//poolCluster.add('community', {
//	   connectionLimit: CommunityConfig.connectionLimit ? CommunityConfig.connectionLimit : 10,
//	   host: CommunityConfig.host,
//	   user: CommunityConfig.user,
//	   password: CommunityConfig.password,
//	   database: CommunityConfig.database
//});

//multitenancy.parser(DaoConfig, poolCluster);
dynamicPool.parser(poolCluster, function(){
    logger.info("Db cluster pool is ready");
});

/*
 * database name to poolName map
*/
//module.exports.dbPoolMap = multitenancy.poolMap;
module.exports.poolCluster = poolCluster;

process.on('customerror', function(){
	poolCluster.end(function(err){
       logger.error(moduleName, "Error in DBPool cluster setup " + err);
	});
});