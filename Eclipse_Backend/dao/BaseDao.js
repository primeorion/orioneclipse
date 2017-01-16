/**
 * Base Class, all DAOs should inherit this
 */
"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var middlewareUtils = require('helper').middlewareUtils;
var localCache = require('service/cache').local;
var config = require('config');
var constants = config.orionConstants;
var queryTimeout = constants.queryTimeout;

var BaseDao = function(){}

/**
 * 
 */
BaseDao.prototype.getConnection = function(data){
  var cacheConnection = localCache.get(data.reqId);
  if(cacheConnection == null)
    return null;
  else{	  
	  var connection = cacheConnection.connection; 
	  var tempConnection = {};
	  tempConnection.query = function(){
		  var args = arguments;
		  var json = {};
		  var query = args[0];
		  json.timeout = queryTimeout;
		  json.sql = query;
		  args[0] = json;
		  logger.debug("Executing following db query" + query);
		  return connection.query.apply(connection, args);
	  }
	  return tempConnection;
  }
}
/**
 * 
 */
BaseDao.prototype.getCommonDBConnection = function(data){
	return localCache.get(data.reqId).common;	
}

BaseDao.prototype.getCommunityDBConnection = function(data){
	return localCache.get(data.reqId).community;	
}

/** 
* Get DB Connection
**/
var getDbConnection;
BaseDao.prototype.getDbConnection = getDbConnection = function(req, cb){ 
  // return new Promise(function(resolve, reject) {
  logger.info("Getting new db connection!!!");           
    middlewareUtils.associateDBFirmConnectionWithReq(req, null, function(err, connection){
      if(err) {
        logger.error("Error in function BaseDao.getDbConnection(). \n Error :" + err);         
        return cb(err, null);
      }
      middlewareUtils.startTransactionWithConnection(connection, function(err){
        if(err){
          logger.error("Error in function BaseDao.getDbConnection(). \n Error :" + err);           
          return cb(err, null);
        }else{          
          // resolve("Success!!!");
          return cb(null, "Success!!!");
        }
      });
    });
  // });
}

module.exports = new BaseDao();

/**
 * How to use
 *  var baseDao = require('dao/BaseDao.js'); 
 * 
 *  var firmConnection = baseDao.getConnection(data); //to get FirmSpecific connection
 *  var commonConnection = baseDao.getCommonDBConnection(data); // to get common DB connection
 */

