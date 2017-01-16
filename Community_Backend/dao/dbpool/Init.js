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

// decoding password
var decodedPassword = poolService.configurationDecoder({"password": DaoConfig.password}, ['password']);

var poolCluster = mysql.createPoolCluster({
	restoreNodeTimeout : restoreNodeTimeout
});

/*
 * connectTimeout - creating connection with database, 10000
 * acquireTimeout - acquiring connection from pool, 10000
*/
poolCluster.add('common', {
   connectionLimit: DaoConfig.connectionLimit ? DaoConfig.connectionLimit : 10,
   host: DaoConfig.host,
   user: DaoConfig.user,
   password: decodedPassword.password,
   database: DaoConfig.database
});

poolCluster.add('community', {
	   connectionLimit: CommunityConfig.connectionLimit ? CommunityConfig.connectionLimit : 10,
	   host: CommunityConfig.host,
	   user: CommunityConfig.user,
	   password: decodedPassword.password,
	   database: CommunityConfig.database
});

//multitenancy.parser(DaoConfig, poolCluster);
dynamicPool.parser(poolCluster, function(){
    logger.info("Db cluster pool is ready");
});

/*
 * database name to poolName map
*/
//module.exports.dbPoolMap = dynamicPool.poolMap;
//module.exports.dbPoolMap = multitenancy.poolMap;
module.exports.poolCluster = poolCluster;

process.on('customerror', function(){
	poolCluster.end(function(err){
       logger.error(moduleName, "Error in DBPool cluster setup " + err);
	});
});