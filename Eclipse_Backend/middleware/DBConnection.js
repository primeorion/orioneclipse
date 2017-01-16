"use strict";

var moduleName = __filename;
var localCache = require('service/cache').local;
var poolCluster = require('dao/dbpool/Init.js').poolCluster;

//should be called after session is set
var config = require('config');
var response = require('controller/ResponseController.js');
var logger = require('helper/Logger.js')(moduleName);
var commonDBName = config.env.prop.orion.db.database;
var constants = config.orionConstants;
var messages = config.messages;
var httpResponseCode = config.responseCodes;
var middlewareUtils = require('helper').middlewareUtils;

function prepareRequestData(req) {
	var body = req.body;
	var queryData = req.query;
	var data = req.data; 
	for (var key in body) {
		if (body.hasOwnProperty(key)) {
			var value = body[key];
			data[key] = value;
		}
	}
	for(var key in queryData) {
		var value = queryData[key];
		data[key] = value;
	}

	req.data = data;
	if(req.query.search){		
		req.query.search = unescape(req.query.search);
	}
}

module.exports.firm = function () {
	var firmDbMiddleware = function(req, res, next){
		var reqId = req.data.reqId;
		var cacheObject = localCache.get(reqId);
		logger.debug("got connection for firm"+cacheObject.connection);
		res.on('finish', function finish() {
			requestFinishCleanupForFirm(reqId, cacheObject, res, function(){
				
			});
		});
		res.on('close', function finish() {
			var intervalId = setInterval(function(){
				if(res.finished){					
					requestFinishCleanupForFirm(reqId, cacheObject, res, function(){
						clearInterval(intervalId);
					});
				}
			}, 5000);
		});
		middlewareUtils.associateDBFirmConnectionWithReq(req, res, function(err, connection){
			if(err) {
				logger.error(err);
				return response(messages.internalServerError, httpResponseCode.INTERNAL_SERVER_ERROR, null, res);
			}
			middlewareUtils.startTransactionWithConnection(connection, function(err){
				if(err){
					logger.error(err);
					return response(messages.internalServerError, httpResponseCode.INTERNAL_SERVER_ERROR, null, res);
				}else{
					next();
				}
			});
		});
		/*
		 * potential risk here for more number of keys in data
		 */
		prepareRequestData(req);
	};

	firmDbMiddleware.unless = require("express-unless");
	return firmDbMiddleware;
};

var dbPoolDebugger = require("helper/DbPoolDebuger.js");
var requestFinishCleanupForFirm;
module.exports.requestFinishCleanupForFirm = requestFinishCleanupForFirm = function(reqId, cacheObject, res, cb){

	var status = res.statusCode !== httpResponseCode.INTERNAL_SERVER_ERROR && res.statusCode !== httpResponseCode.UNPROCESSABLE;
	if(cacheObject.actualConnection){
		var tempConnection = cacheObject.actualConnection;
        cacheObject.actualConnection = cacheObject.connection;
        cacheObject.connection = tempConnection;
    }
	var connection = cacheObject.connection;
	if(!!connection){
		middlewareUtils.finishTransactionWithConnection(connection, status, function(err){
			logger.info(" Releasing Firm connection with threadId - " + connection.threadId);
			dbPoolDebugger.remove(connection);
			connection.release();
			if(cacheObject.actualConnection){
				dbPoolDebugger.remove(cacheObject.actualConnection);
				(cacheObject.actualConnection).release();
			}
			localCache.del(reqId);
			cb(err);
		});
	}
	
}

function requestFinishCleanupForCommon(reqId, cacheObject, res, cb){
	 
	 var status = res.statusCode !== httpResponseCode.INTERNAL_SERVER_ERROR && res.statusCode !== httpResponseCode.UNPROCESSABLE;
	 var connection = cacheObject.common;
	 if(!!connection){
		 middlewareUtils.finishTransactionWithConnection(connection, status, function(err){
			 logger.info(" Releasing CommonDB connection with threadId - " + connection.threadId);
			 dbPoolDebugger.remove(connection);
			 connection.release();
	 		 localCache.del(reqId);
	 		 cb(err);
		 });
	 }
 }

module.exports.common  = function(req, res, next){
	var reqId = req.data.reqId;
	var cacheObject = localCache.get(reqId);
	res.on('finish', function(){
			requestFinishCleanupForCommon(reqId, cacheObject, res, function(){
		});
	});
	res.on('close', function(){
		var intervalId = setInterval(function(){
			if(res.finished){					
				requestFinishCleanupForCommon(reqId, cacheObject, res, function(){
					clearInterval(intervalId);
				});
			}
		}, 5000);
	});
	middlewareUtils.associateDBCommonConnectionWithReq(req, res, function(err, connection){
		if(err) {
			logger.error(err);
			return response(messages.internalServerError, httpResponseCode.INTERNAL_SERVER_ERROR, null, res);
		}
		middlewareUtils.startTransactionWithConnection(connection, function(err, data){
			if(err){
				logger.error(err);
				return response(messages.internalServerError, httpResponseCode.INTERNAL_SERVER_ERROR, null, res);
			}else{
				next();
			}
		});
	});
};

function requestFinishCleanupForCommunity(reqId, cacheObject, res, cb){
	 
	 var status = res.statusCode !== httpResponseCode.INTERNAL_SERVER_ERROR && res.statusCode !== httpResponseCode.UNPROCESSABLE;
	 var connection = cacheObject.community;
	 if(!!connection){
		 middlewareUtils.finishTransactionWithConnection(connection, status, function(err){
			 logger.info(" Releasing Community connection with threadId - " + connection.threadId);
			 connection.release();
	 		 localCache.del(reqId);
	 		 cb(err);
		 });
	 }
}

module.exports.community  = function(req, res, next){
	var reqId = req.data.reqId;
	var cacheObject = localCache.get(reqId);
	res.on('finish', function(){
		requestFinishCleanupForCommunity(reqId, cacheObject, res, function(){
		});
	});
	res.on('close', function(){
		requestFinishCleanupForCommunity(reqId, cacheObject, res, function(){
		});
	});
	middlewareUtils.associateDBCommunityConnectionWithReq(req, res, function(err, connection){
		if(err) {
			logger.error(err);
			return response(messages.internalServerError, httpResponseCode.INTERNAL_SERVER_ERROR, null, res);
		}
		middlewareUtils.startTransactionWithConnection(connection, function(err, data){
			if(err){
				logger.error(err);
				return response(messages.internalServerError, httpResponseCode.INTERNAL_SERVER_ERROR, null, res);
			}else{
				next();
			}
		});
	});
};
