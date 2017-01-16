/*
 will create new entry in poolCluster or create completely new poolCluster
 */
"use strict";

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);

module.exports = {
    'createPoolCluster' : function(tempObject, poolCluster){
        logger.info("Create pool cluster service called (createPoolCluster())");
        for(var poolName in tempObject){
            if(tempObject.hasOwnProperty(poolName)){
                var poolConf = tempObject[poolName];
                logger.debug("poolName = "+poolName);
                try{
                	poolCluster.add(poolName, poolConf);    		                	
                }catch(err){
                	logger.error(err);
                }
            }
        }
        logger.info("Create pool cluster service completed successfully (createPoolCluster())");
        return poolCluster;
    },

    'updatePoolConf' : function(tempObject, poolCluster){
        logger.info("Update pool configuration service called (updatePoolConf())");
        for(var poolName in tempObject){
            if(tempObject.hasOwnProperty(poolName)){
                var poolConf = tempObject[poolName];
                poolCluster.remove(poolName);
                poolCluster.add(poolName, poolConf);
            }
        }
        logger.info("Updte pool configuration service completed successfully (updatePoolConf())");
    },

    'updateFirmDbConf' : function(data, localCache){
        logger.info("Update firm db configuration service called (updateFirmDbConf())");
        var dbPoolMap = localCache.get("dbToPoolMap");
        var id = data.firmId;
        var firmName = data.firmName;
        var oldFirmName = localCache.get(id);
        localCache.put(id, firmName);
        dbPoolMap[firmName] = dbPoolMap[oldFirmName];
        logger.info("Update firm db configuration service completed successfully (updateFirmDbConf())");
    },

    'base64Decoder' : function(data){
        if(!!data){
            return new Buffer(data, 'base64').toString();
        }
        logger.error("Error in encoding data (base64Decoder())");
        return null;
    },

    'configurationDecoder' : function(row, propToDecode){
        logger.info("Configure decoder calledservice called (configurationDecoder())");
        var dataToRet = {};
        for(var prop in propToDecode){
            if(propToDecode.hasOwnProperty(prop)){
                var propName = propToDecode[prop];
                dataToRet[propName] = this.base64Decoder(row[propName]);
            }
        }
        return dataToRet;
    }
};