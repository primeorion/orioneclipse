"use strict";

var moduleName = __filename;

var util = require('util');

var logger = require("helper/Logger.js")(moduleName);

var localCache = require("service/cache").local;
var pool = localCache.get("poolCluster");

var utilFunctions = require('dao/util/UtilDao');

var DbLoggingFormat = function() {
};

/**
 * @method log called when to log any request or response or exception
 * @param level {string} Level in logger
 * @param logType {string} logType in logger
 * @param meta  {Object} JSON object in logger
 * @param callback {function} callback when finished
 */
DbLoggingFormat.prototype.log = function(logType, meta, callback) {
  
  logger.info(" Getting Common Connection from pool for request, response logging ........... ");
  
  pool.getConnection("common", function (err, connection) {
      if(err){
    	logger.error(err);
        return callback(err, null);
      }
      
      logger.info(" Common Connection Got with Thread ID - " + connection.threadId);
      
      var tableName = logType;
      if(tableName === 'requestLog'){
        var values = requestFieldParser(meta);
      } else if (tableName === 'responseLog'){
        var values = responseFieldParser(meta);
      } else {
        var values = exceptionFieldParser(meta);
      }
      connection.query('INSERT INTO '+ tableName + ' SET ?', values, function(err, rows, fields) {    	  
    	  logger.info(" Releasing Firm connection with threadId - " + connection.threadId);
		  connection.release();
	        if(err){
	          logger.error(err);
	          return callback(err, null);
	        }
	        //finished
	        callback(null, true);
	      });
    });
  
};

function exceptionFieldParser(dbData){
    var query = {},
    userId        = dbData["userId"]        ? dbData["userId"]	      : null ,
    timestamp     = dbData["timestamp"]	    ? dbData["timestamp"]     : utilFunctions.getSystemDateTime(null),
    correlationId = dbData["correlationId"] ? dbData["correlationId"] : "default" ,
    message       = dbData["message"]       ? dbData["message"]       : null ,
    stackTrace    = dbData["stackTrace"]    ? dbData["stackTrace"]    : null ,
    severity      = dbData["severity"]      ? dbData["severity"]      : "default" ,
    isDeleted     = dbData["isDeleted"]     ? dbData["isDeleted"]     : "0" ,
    createdDate   = dbData["createdDate"]   ? dbData["createdDate"]   : timestamp ,
    createdBy     = dbData["createdBy"]     ? dbData["createdBy"]     : (userId ? userId : "default") ,
    editedDate    = dbData["editedDate"]    ? dbData["editedDate"]    : timestamp ,
    editedBy      = dbData["editedBy"]      ? dbData["editedBy"]      : (userId ? userId : "default") ;
    if(timestamp)
      query["timestamp"]     = timestamp;
    if(correlationId)
      query["correlationId"] = correlationId;
    if(message)
      query["message"]       = message;
    if(stackTrace)
      query["stackTrace"]    = stackTrace;
    if(severity)
      query["severity"]      = severity;
    if(isDeleted)
      query["isDeleted"]     = isDeleted; 
    if(createdDate)
      query["createdDate"]   = createdDate;
    if(createdBy)
      query["createdBy"]     = createdBy;
    if(editedDate)
      query["editedDate"]    = editedDate;
    if(editedBy)
      query["editedBy"]      = editedBy;
  
    return query;
}

function responseFieldParser(dbData){
    var query = {},
    userId        = dbData["userId"]        ? dbData["userId"]	      : null ,
    timestamp     = dbData["timestamp"]	    ? dbData["timestamp"]     : utilFunctions.getSystemDateTime(null),
    correlationId = dbData["correlationId"] ? dbData["correlationId"] : "default" ,
    response      = dbData["response"]      ? util.inspect(dbData["response"],false,null)    : null ,
    isDeleted     = dbData["isDeleted"]     ? dbData["isDeleted"]     : "0" ,
    createdDate   = dbData["createdDate"]   ? dbData["createdDate"]   : timestamp ,
    createdBy     = dbData["createdBy"]     ? dbData["createdBy"]     : (userId ? userId : "default") ,
    editedDate    = dbData["editedDate"]    ? dbData["editedDate"]    : timestamp ,
    editedBy      = dbData["editedBy"]      ? dbData["editedBy"]      : (userId ? userId : "default") ;
    if(timestamp)
      query["timestamp"]     = timestamp;
    if(correlationId)
      query["correlationId"] = correlationId;
    if(response)
      query["response"]      = response;
    if(isDeleted)
      query["isDeleted"]     = isDeleted;
    if(createdDate)
      query["createdDate"]   = createdDate;
    if(createdBy)
      query["createdBy"]     = createdBy;
    if(editedDate)
      query["editedDate"]    = editedDate;
    if(editedBy)
      query["editedBy"]      = editedBy;
  
    return query;
}

function requestFieldParser(dbData){
    var query = {},
    timestamp     = dbData["timestamp"]	    ? dbData["timestamp"]     : utilFunctions.getSystemDateTime(null),
    userId        = dbData["userId"]        ? dbData["userId"]	      : null ,
    firmId        = dbData["firmId"]        ? dbData["firmId"]        : null ,
    partnerId     = dbData["partnerId"]     ? dbData["partnerId"]     : null ,
    appName       = dbData["appName"]       ? dbData["appName"]       : "Orion Eclipse Framework" ,
    appPath       = dbData["appPath"]       ? dbData["appPath"]       : null ,
    correlationId = dbData["correlationId"] ? dbData["correlationId"] : "default" ,
    hostName      = dbData["hostName"]      ? dbData["hostName"]      : "default" ,
    clientIP      = dbData["clientIP"]      ? dbData["clientIP"]      : null ,
    verb          = dbData["verb"]          ? dbData["verb"]          : null ,
    routeUrl      = dbData["routeUrl"]      ? "http://"+dbData["routeUrl"]        : null ,
    parameters    = dbData["parameters"]    ? util.inspect(dbData["parameters"])	: null ,
    request       = dbData["request"]       ? util.inspect(dbData["request"])     : null ,
    isDeleted     = dbData["isDeleted"]     ? dbData["isDeleted"]     : "0" ,
    createdDate   = dbData["createdDate"]   ? dbData["createdDate"]   : timestamp ,
    createdBy     = dbData["createdBy"]     ? dbData["createdBy"]     : (userId ? userId : "default") ,
    editedDate    = dbData["editedDate"]    ? dbData["editedDate"]    : timestamp ,
    editedBy      = dbData["editedBy"]      ? dbData["editedBy"]      : (userId ? userId : "default") ;

    if(timestamp)
      query["timestamp"]     = timestamp;
    if(userId)
      query["userId"  ]      = userId;
    if(firmId)
      query["firmId"]        = firmId;
    if(partnerId)
      query["partnerId"]     = partnerId;
    if(appName)
      query["appName"]       = appName;
    if(appPath)
      query["appPath"]       = appPath;    
    if(correlationId)
      query["correlationId"] = correlationId;
    if(hostName)
      query["hostName"]      = hostName;
    if(clientIP)
      query["clientIP"]      = clientIP;
    if(verb)
      query["verb"]          = verb;
    if(routeUrl)
      query["routeUrl"]      = routeUrl;
    if(parameters)
      query["parameters"]    = parameters;
    if(request)
      query["request"]       = request;
    if(isDeleted)
      query["isDeleted"]     = isDeleted;
    if(createdDate)
      query["createdDate"]   = createdDate;
    if(createdBy)
      query["createdBy"]     = createdBy;
    if(editedDate)
      query["editedDate"]    = editedDate;
    if(editedBy)
      query["editedBy"]      = editedBy;
  
    return query;
}

module.exports = DbLoggingFormat;
