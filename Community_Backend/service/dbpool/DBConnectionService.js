"use strict";

var moduleName = __filename;
var cache = require("service/cache").local;
var logger = require("helper/Logger.js")(moduleName);
var dynamicPool = require("dao/dbpool/DynamicPool.js");
var config = require("config");
var env = config.env.name;
var communityConnection = config.env.prop.orion["db"].community;
var util = require('util');
var messages = config.messages;
var responseCodes = config.responseCode;

module.exports = {
    'getDbConnectionForFirm' : function(reqData, cb){
        logger.info(" Putting connection for req in local cache (getDbConnectionForFirm())");

        var dbToPoolMap = cache.get("dbToPoolMap");
        var poolCluster = cache.get("poolCluster");
       // var firmId = reqData.firmId;
        //var firmName = cache.get(firmId);
        var firmName = communityConnection.database;
        var poolName = communityConnection.host;

        //var poolName = dbToPoolMap["dev2_orionEclipseFirm_1022"];
        
        var cacheRequestDatacache = cache.get(reqData.reqId);
        logger.debug("the poolMap we have is"+(dbToPoolMap));
        logger.info(" poolname: " + poolName);
        logger.info(" firmname: " + firmName);
        logger.info(" Getting Firm Connection from pool ........... ");
        if(!!poolName && !!firmName){
            poolCluster.getConnection(poolName, function (err, connection) {
                if(err) {
                    logger.error("Error in getting connection (getDbConnectionForFirm())" + err);
                    return cb(err);
                }
                logger.info(" Connection Got with Thread ID - " + connection.threadId);
                connection.changeUser({ database: firmName });
                cacheRequestDatacache.connection = connection;
                cb(null, reqData.reqId);
            });
        }else{
            dynamicPool.addNewFirmToPool(poolCluster, firmId, function(err, data){
                if(err){
                    logger.error("Error in ading new firm to pool (addNewFirmToPool()) " + err);
                    return cb(err);
                }else if(!data){
                    logger.info("No pool found (addNewFirmToPool())");
                    return cb(messages.noPoolFound, responseCodes.internalServerError);
                }else{
                    getDbConnectionForFirm(reqData, cb);
                }
            });
        }
    }
};

