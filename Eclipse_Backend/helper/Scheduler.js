"use strict";

var schedule = require('node-schedule');

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var localCache = require("service/cache").local;
var schedulerService = new (require('service/util/SchedulerService.js'))();
var helper = require("helper");
var unique = helper.uniqueIdGenerator;
var _ = require("lodash");
var dbToPoolMap = localCache.get("dbToPoolMap");
var poolCluster = localCache.get("poolCluster");
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 0;
rule.minute = 1;
rule.second = 1;
var dbPoolDebugger = require("helper/DbPoolDebuger.js");

setTimeout(function(){
	_.keys(dbToPoolMap).forEach(function(value, index){
	var firmName = value;
	var poolName = dbToPoolMap[firmName];
	schedule.scheduleJob(rule, function(data){
		var reqId = unique.get();
		var cacheObject = {};
		localCache.put(reqId , cacheObject);
		poolCluster.getConnection(poolName, function(err, connection){
			if(err) {
				logger.alert(" Error in associating firm db connection with request (associateDBFirmConnectionWithReq()) " +err);
			}
			connection.changeUser({ database: firmName });
			cacheObject.connection = connection;
			dbPoolDebugger.put({url : '/schedular'}, connection);
			logger.debug("Rule for scheduler is " + rule);
			logger.info("Scheduler service configured");
			schedulerService.changeStatus({reqId : reqId}, function(err, data){
				if(err){
					logger.error("Scheduler service error " + err);
				}
				connection.release();
				localCache.del(reqId);
			});
		})
	});
})	
}, 10000);