"use strict";

var moduleName = __filename;
var config = require('config');
var logger = require('helper/Logger')(moduleName);
var poolService = require('service/dbpool/PoolService');
var localCache = require('service/cache').local;


module.exports.parser = function(poolCluster, cb){
    poolCluster.getConnection('common', function(err, connection){
        if(err){
            logger.error("Error in get common db connection"+err);
            return;
            //return process.exit(1);
        }
        connection.query("SELECT * FROM firm", function(err, rows){
        	connection.release();
            if(err){
                logger.error("Error in get firm db connection"+err);
                return;
                //return process.exit(1);
            }else{
                var tempObject = {};
                rows.forEach(function(value, index){
                    var firmDbName = value.database;
                    var port = value.port;
                    port = port ? port : 3306;
                    var userNameAndPassword = poolService.configurationDecoder(value, ['username','password']);
                    var poolName = value.server;
                    logger.debug("Before PoolName is"+poolName);
                    if(userNameAndPassword.username && userNameAndPassword.password){                    	
                    	tempObject[poolName] = {
                    			connectionLimit : value.poolLimit ? value.poolLimit : 10,
                    					host : value.server,
                    					user : userNameAndPassword.username,
                    					password : userNameAndPassword.password,
                    					port : port
                    	};
                    }
                });
                poolService.createPoolCluster(tempObject, poolCluster);
                if(!!cb){
                    cb();
                }
            }
        });
    });
};

/*
 * will be called from loginservice when user who is trying to is not present in localcache.
*/module.exports.addNewFirmToPool = function(poolCluster, firmId, cb){
	
	logger.info("addNewFirmToPool() getting Firm and adding it to PoolCluster with firmId " + firmId);
	
    if(!!firmId){
        poolCluster.getConnection('common', function(err, connection){
            connection.query("SELECT * FROM firm WHERE orionEclipseFirmId = ?", [firmId], function(err, rows){
            	connection.release();
                if(err){
                    logger.error(err);
                    cb(err);
                }else{
                    logger.debug(rows);
                    if(rows && rows.length > 0){
                        var value = rows[0];
                        var firmDbName = value.database;
                        var port = value.port;
                        port = port ? port : 3306;
                        
                        var status = false;
                        var userNameAndPassword = poolService.configurationDecoder(value, ['username','password']);
                        
                        var rTurn = {};
                    	rTurn["poolName"] = va.server;
                    	rTurn["database"] = value.database;                	
                        rTurn["user"]= userNameAndPassword.username;
                        rTurn["password"]= userNameAndPassword.password;
                        
                        var poolName = value.server;
                        var tempObject = {};
                        if(userNameAndPassword.username && userNameAndPassword.password){
                        	localCache.put(firmId, rTurn);
                        	status = true;
	                        tempObject[poolName] = {
	                            connectionLimit : value.poolLimit ? value.poolLimit : 10,
	                            host : value.server,
	                            user : userNameAndPassword.username,
	                            password : userNameAndPassword.password,
	                            port : port
	                        };
                        }
                        poolService.createPoolCluster(tempObject, poolCluster);
                        if(status){                        	
                        	cb(null, poolCluster);
                        }else{
                        	cb(null, null);
                        }
                    } else{
                        cb(null, null);
                    }
                }
            });
        });
    }else{
        cb(null, null);
    }
};

