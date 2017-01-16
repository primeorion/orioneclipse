/**
 * Request/Response Logger file
 */
"use strict";

var mysql_logger = require('./mysql-logger/DBHelper.js');

var dblogger =   new mysql_logger();

function requestlogger(res, cb){
	var data 	= res.req["data"] ? res.req["data"] : null;
	var user	= data ? (("user" in data) ? data["user"]		: null) : null;
	var userId	= user ? (("userId" in user) ? user["userId"]	: null) : null;
	var firmId	= user ? (("firmId" in user) ? user["firmId"]	: null) : null;
	var search	= user ? (("search" in user) ? user["search"]	: null) : null;
	
	var isDeleted = data ? (data["isDeleted"] ? data["isDeleted"] : 0) : 0;

	dblogger.log('requestLog', {
		"userId"		: userId,
		"firmId"		: firmId,
		"appPath"		: res.req.originalUrl,
		"correlationId"	: res.req.correlationId,
		"hostName"		: res.req.headers.host,
		"verb"			: res.req.method,
		"routeUrl"		: res.req.headers.host+res.req.originalUrl,
		"isDeleted"		: isDeleted,
		"request"		: res.req.body,
		"parameters"	: res.req.params,
		"clientIP"  	: res.req.clientIp
	}, cb);
}

function responselogger(res,responseData, cb){
	var data 	= res.req["data"] ? res.req["data"] : null;
	var user	= data ? (("user" in data) ? data["user"]		: null) : null;
	var userId	= user ? (("userId" in user) ? user["userId"]	: null) : null;

	var isDeleted = data ? (data["isDeleted"] ? data["isDeleted"] : 0) : 0;
	responseData = responseData ? responseData : null;

	dblogger.log('responseLog', {
		"userId"		: userId,
		"correlationId"	: res.req.correlationId,
		"isDeleted"		: isDeleted,
		"response"		: responseData
	}, cb);
}

function exceptionlogger(res,message,stackTrace,severity, cb){
	var data 	= res.req["data"] ? res.req["data"] : null;
	var user	= data ? (("user" in data) ? data["user"]		: null) : null;
	var userId	= user ? (("userId" in user) ? user["userId"]	: null) : null;

	var isDeleted = data ? (data["isDeleted"] ? data["isDeleted"] : 0) : 0;

	dblogger.log('exceptionLog', {
		"userId"		: userId,
		"correlationId"	: res.req.correlationId,
		"message"		: message,
		"stackTrace"	: stackTrace,
		"severity"		: severity,
		"isDeleted"		: isDeleted
	}, cb);
}

module.exports.requestlogger 	= requestlogger;
module.exports.responselogger 	= responselogger;
module.exports.exceptionlogger 	= exceptionlogger;