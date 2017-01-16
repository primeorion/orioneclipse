"use strict";

var moduleName = __filename;
var localCache = require('service/cache').local;
var poolCluster = require('dao/dbpool/Init.js').poolCluster;
var dbToPoolMap = require('dao/dbpool/Init.js').dbPoolMap;

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
	
}

module.exports.firm = function () {
	var firmDbMiddleware = function(req, res, next){
		var reqId = req.data.reqId;
		var cacheObject = localCache.get(reqId);

		res.on('finish', function finish() {
			requestFinishCleanupForFirm(reqId, cacheObject, res, function(){
				
			});
		});
		res.on('close', function finish() {
			requestFinishCleanupForFirm(reqId, cacheObject, res, function(){
			});
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

function requestFinishCleanupForFirm(reqId, cacheObject, res, cb){
	var status = res.statusCode !== httpResponseCode.INTERNAL_SERVER_ERROR && res.statusCode !== httpResponseCode.UNPROCESSABLE;
	var connection = cacheObject.connection;
	if(!!connection){
		middlewareUtils.finishTransactionWithConnection(connection, status, function(err){
			logger.info(" Releasing Firm connection with threadId - " + connection.threadId);
			connection.release();
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
			requestFinishCleanupForCommon(reqId, cacheObject, res, function(){
		});
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
