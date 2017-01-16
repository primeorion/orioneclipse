"use strict";

var moduleName = __filename;
var config = require('config');
var messages = config.messages;
var constants = config.orionConstants;
var responseCode = config.responseCodes;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
// var analysisDao = new(require('dao/post_import_analysis/AnalysisDao'))();
var localCache = require('service/cache').local;
var unique = require('helper').uniqueIdGenerator;
var dbConnection = require('./../../middleware/DBConnection.js');

var ImportLogDao = function() {};

ImportLogDao.prototype.createOrUpdateImportLog = function(data, cb) {

  var firmConnection = baseDao.getConnection(data),
  query = "CALL CreateOrUpdateImportLog(?, ?, ?, ?, ?, ?)"; 
  logger.debug("Query Ran:", query +  ". Parameters: " + [data.sessionId, data.column_name, data.etl_status || null, data.user.id || null, data.type || null, data.reason || null]); 

  if(firmConnection == null){
    var reqId = unique.get(),
    cacheObject = {},
    column_name = data.column_name; 
    
    data.reqId = reqId;
    localCache.put(reqId , cacheObject);

    baseDao.getDbConnection({data: data}, function(err, resp){
      if(err){
        logger.error("Error in Import Log Dao in function ImportLogDao.createOrUpdateImportLog(). \n Error :" + err);
      return cb(err, null);
      }else{
        data.reqId = reqId;
        firmConnection = baseDao.getConnection(data);
        return firmConnection.query(query, [data.sessionId, column_name, data.etl_status || null, data.user.userId || null, data.type || null, data.reason || null], function(err, rows, fields) {        
          if (err) {
            logger.error("Error while executing Query: " + query + " with parameters: " + [data.sessionId, data.column_name, data.etl_status || null, data.user.id || null, data.type || null, data.reason || null] + "  in ImportLogDao.prototype.createOrUpdateImportLog(). \n Error :" + err);
            dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 422}, function(err, resp){});
            return cb(err, null);
          } else {
            logger.info("Successfully executed query: " + query + " with parameters: " + [data.sessionId, data.column_name, data.etl_status || null, data.user.id || null, data.type || null, data.reason || null] + "  in ImportLogDao.prototype.createOrUpdateImportLog().");
            dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 201}, function(err, resp){
              return cb(err, "Success!!!");
            });       
          }
        });  
      }
    })    
  }else{
    firmConnection.query(query, [data.sessionId, data.column_name, data.etl_status || null, data.user.id || null, data.type || null, data.reason || null], function(err, rows, fields) {        
      if (err) {
        logger.error("Error while executing Query: " + query + " with parameters: " + [data.sessionId, data.column_name, data.etl_status || null, data.user.id || null, data.type || null, data.reason || null] + "  in ImportLogDao.prototype.createOrUpdateImportLog(). \n Error :" + err);
        return cb(err, null);
      } else {
         return cb(null, "Success!!!");       
      }
    });
  }
}

module.exports = ImportLogDao;