/**
 * Database connection test cases
 */
"use strict";

var chai = require('chai');
var mysql = require("mysql");

var assert = chai.assert;
var expect = chai.expect;

var dbConnectivityCheck = function(connection, cb){
	connection.query('SELECT 1 + 1 AS solution', function(err, row){
		cb(err, row)
	});
};

var poolConnectivityCheck = function(pool, cb, poolName){
	if(!!poolName){
		pool.getConnection(poolName, function(err, connection){
			cb(err, connection);
		})
	}else{
		pool.getConnection(poolName, function(err, connection){
			cb(err, connection);
		})
	}
};

var poolClusterConnectivityCheck = function(mysqlPoolCluster,  poolsObject, cb){
	var poolLength = 0;
	for(var pool in poolsObject){
		poolLength ++;
	}
	var checkedPoolLength = 0;
	for(var pool in poolsObject){
		poolConnectivityCheck(mysqlPoolCluster, function(err, connection){
			if(err){
				cb(err, connection);
			}
			checkedPoolLength ++;
			if(poolLength == checkedPoolLength){
				cb(err, connection);
			}

		}, pool);
	}
};

describe('Database Connectivity should be present', function () {

	var DaoConfig = require('config').env.prop.orion.db;
	var poolCluster = mysql.createPoolCluster();
	var dynamicPool = require('dao/dbpool/DynamicPool.js');

	poolCluster.add('common', {
		connectionLimit: DaoConfig.connectionLimit,
		host: DaoConfig.host,
		user: DaoConfig.user,
		password: DaoConfig.password,
		database: DaoConfig.database
	});
	dynamicPool.parser(poolCluster, function(){
		var poolObject = poolCluster._nodes;
		var dbToPoolMap = dynamicPool.poolMap;

		var totalFirmDbs = 0;
		var checkedFirmDbs = 0;
		for(var db in dbToPoolMap){
			totalFirmDbs+=1;
			(function(db){
				var pool = dbToPoolMap[db];
				describe('checking database Server connectivity with ' + pool, function(){
						it("checking connectivity with database " + db , function(done){
								this.timeout(5000);
								poolConnectivityCheck(poolCluster, function(err, connection){
									expect(err).to.be.null;
									connection.changeUser({database:db});
										dbConnectivityCheck(connection, function(err, data){
											expect(err).to.be.null;
											done();
											checkedFirmDbs+=1;
											if(totalFirmDbs === checkedFirmDbs){
												poolCluster.end();
											}

										});
								}, pool);
						});
				});
			})(db);
		}
	});
});
