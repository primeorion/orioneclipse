"use strict";

var moduleName = __filename;
var cache = require("service/cache").local;
var logger = require("helper/Logger.js")(moduleName);
var dynamicPool = require("dao/dbpool/DynamicPool.js");
var config = require("config");
var messages = config.messages;
var responseCodes = config.responseCode;
var util = require("util");
var dbPoolDebugger = require("helper/DbPoolDebuger.js");

module.exports = {
    'getDbConnectionForFirm' : function(reqData, cb){
    	
    	var self = this;
    	
        logger.info(" Putting connection for req in local cache (getDbConnectionForFirm())");
        var poolCluster = cache.get("poolCluster");
        var firmId = reqData.firmId;
        var credObj = cache.get(firmId);
        if(credObj){
        	
        	var firmName = credObj["database"];
        	var poolName = credObj["poolName"];
        	var cacheRequestDatacache = cache.get(reqData.reqId);
        	logger.info(" poolname: " + poolName);
        	logger.info(" firmname: " + firmName);
        	logger.info(" Getting Firm Connection from pool ........... ");
        	logger.info(" Db connection Details: firmName : " + firmName + ", userName: " + credObj.user)
            logger.debug("The connection object i got is"+cacheRequestDatacache.connection);
        	if(cacheRequestDatacache.connection){
                cacheRequestDatacache.actualConnection = cacheRequestDatacache.connection;
            }
            poolCluster.getConnection(poolName, function (err, connection) {
                if(err) {
                        logger.alert("Error in getting connection (getDbConnectionForFirm())" + err);
                        return cb(err);
                }
                logger.info(" Connection Got with Thread ID - " + connection.threadId);
                connection.changeUser(credObj);
                cacheRequestDatacache.connection = connection;
                dbPoolDebugger.put({url : '/admin/token'}, connection);
                cb(null, reqData.reqId);
            });
        }else{
            dynamicPool.addNewFirmToPool(poolCluster, firmId, function(err, data){
                if(err){
                    logger.error("Error in ading new firm to pool (addNewFirmToPool()) " + err);
                    return cb(err);
                }else if(!data){
                    logger.info(messages.noPoolFound);
                    logger.alert(messages.noPoolFound);
                    return cb(messages.noPoolFound, responseCodes.internalServerError);
                }else{
                	logger.info("addNewFirmToPool() added firm to poolCluster");
                	self.getDbConnectionForFirm(reqData, cb);
                }
            });
        }
    }
};

