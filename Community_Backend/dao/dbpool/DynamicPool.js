"use strict";

var moduleName = __filename;
var config = require('config');
var logger = require('helper/Logger')(moduleName);
var poolService = require('service/dbpool/PoolService');

var dbToPoolMap = {};

module.exports.parser = function(poolCluster, cb){
    poolCluster.getConnection('common', function(err, connection){
        if(err){
            logger.error(err);
            return;
            //return process.exit(1);
        }
        connection.query("SELECT * FROM firm", function(err, rows){
        	connection.release();
            if(err){
                logger.error(err);
                return;
                //return process.exit(1);
            }else{
                var tempObject = {};
                rows.forEach(function(value, index){
                    var firmDbName = value.database;
                     var port = value.port;
                    port = port ? port : 3306;
                    //dbToPoolMap[firmDbName] = value.server;
                    var userNameAndPassword = poolService.configurationDecoder(value, ['username','password']);
                    var poolName = value.server;
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
    if(!!firmId){
        poolCluster.getConnection('common', function(err, connection){
            connection.query("SELECT * FROM firm WHERE orionEclipseFirmId = ?", [firmId], function(err, rows){
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
                    	rTurn["poolName"] = value.server;
                    	rTurn["database"] = value.database;                	
                        rTurn["user"]= userNameAndPassword.username;
                        rTurn["password"]= userNameAndPassword.password;
                        //dbToPoolMap[firmDbName] = value.server;
                        
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

module.exports.poolMap = dbToPoolMap;