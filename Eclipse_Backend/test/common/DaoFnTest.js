"use strict";

var moduleName = __filename;

var pathArr = __dirname.split("\\");
var pathArrLength = pathArr.length;
var newPathArr = [];

for(var i = 0 ; i < pathArrLength - 2 ; i++){
    newPathArr.push(pathArr[i]);
}
newPathArr = newPathArr.join("\\");

require('app-module-path').addPath(newPathArr);

require('service/dbpool/DBPoolInitService');

var localCache = require('service/cache').local;
var logger = require('helper/Logger.js')(moduleName);
var unique = require('helper').uniqueIdGenerator;

var fn = require("dao/security/SecuritySetDao.js").createSecuritySetDetail;

var dbName = "dev_orioneclipsefirm_999";

describe("===== Service ============", function(){
    it(" Should call the function and return result accordingly ", function(done){
        this.timeout(10000);
        setTimeout(function(){
            var dbToPoolMap = localCache.get("dbToPoolMap");

            var poolName = dbToPoolMap[dbName];

            var poolCluster = localCache.get("poolCluster");
            after(function(done){
                logger.info("ending the connection");
                poolCluster.end();
                done();
            });

            if(!!poolCluster){
                poolCluster.getConnection(poolName, function(err, connection){
                    if(err){
                        return logger.error(moduleName, err);
                    }else{
                        connection.changeUser({database:dbName});
                        var cacheObj = {};
                        var id = unique.get();
                        cacheObj.connection = connection;
                        localCache.put(id, cacheObj);

                        var arr = [];
                        var main = {};
                        main.reqId = id;
                        
                        var daoArg = {};
                        daoArg.securitySetId = 1;
                        daoArg.securityId = 8496;
                        daoArg.isDeleted = 0;
                        daoArg.createdDate = "0000-00-00 00:00:00";
                        daoArg.editedDate = "0000-00-00 00:00:00";
                        daoArg.createdBy = 0;
                        daoArg.editedBy = 0;
                        arr.push(daoArg);
                        
                        var daoArg2 = {};
                        daoArg2.reqId = id;
                        daoArg2.securitySetId = 1;
                        daoArg2.securityId = 4823;
                        daoArg2.isDeleted = 0;
                        daoArg2.createdDate = "0000-00-00 00:00:00";
                        daoArg2.editedDate = "0000-00-00 00:00:00";
                        daoArg2.createdBy = 0;
                        daoArg2.editedBy = 0;
                        arr.push(daoArg2);
                        main.entity = arr;
                        fn(main, function(err, rows){
                            if(err){
                                return logger.error(moduleName, err);
                            }
                            logger.info(rows);
                            done();
                        });
                    }
                })
            }
        }, 0);
    });
});

