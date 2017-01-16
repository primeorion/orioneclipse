"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');
var util = require('util');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
// var analysisDao = new(require('dao/post_import_analysis/AnalysisDao'))();
var localCache = require('service/cache').local;
var unique = require('helper').uniqueIdGenerator;
var dbConnection = require('./../../middleware/DBConnection.js');

var TradeInstanceDao = function () { }

TradeInstanceDao.prototype.saveTradeInstance = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push(" INSERT INTO tradeInstance (description, createdDate, createdBy, editedDate, editedBy, userId, tradecreationStatusId, notes, tradingAppID ");
    query.push(" ) VALUES ");
    query.push(" ('" + data.tradesInstance.description + "','" + currentDate + "'," + userId);
    query.push(",'" + currentDate + "', " + userId + "," + userId + ", 1 ," + "'" + data.tradesInstance.notes + "'," + data.tradesInstance.tradingAppId + " )");
    query = query.join("");
    logger.debug(query);
    connection.query(query, [data.tradesInstance], function (err, result) {
        if (err) {
            return cb(err, null);
        }
        return cb(null, result);
    });
};

/** 
* Creating Trade Instance
* data: {userId: 66, appId: 1, description: "Rebalancer", notes: "ETL Rebalancing", firmId: 3}
**/
TradeInstanceDao.prototype.createTradeInstance = function (data, cb) {     
  var query = "CALL CreateInstanceId(?, ?, ?, ?)";
  logger.debug("Query Ran:", query +  ". Parameters: " + [data.userId, data.appId, data.description, data.notes]);    
  var dta = {
      user: {
          firmId: data.firmId
      }
  };
  var reqId = unique.get(),
  cacheObject = {};
  dta.reqId = reqId;  
  localCache.put(reqId , cacheObject);
  baseDao.getDbConnection({data: dta}, function(err, resp){
    if(err){      
      logger.error("Error in Trade Instance Dao in function TradeInstanceDao.createTradeInstance(). \n Error :" + err);     
      return cb(err, null);
    }
    else{
      var connection = baseDao.getConnection(dta); 
      return connection.query(query, [data.userId, data.appId, data.description, data.notes], function (err, result) {
        logger.info("Releasing DB Connection to generate Instance Id!!!");       
        if (err) {
          dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 422}, function(err, resp){})
          return cb(err, null);
        }else{    
          dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 201}, function(err, resp){
            return cb(null, {instance_id: result[0][0]['LAST_INSERT_ID()']});
          })        
              
        }        
      });
    }
  });
};

TradeInstanceDao.prototype.deleteTradeInstance = function(data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var query = "Delete from tradeInstance where id = ?";

    firmConnection.query(query, [data.tradesInstance.instanceId], function(err, rows) {
            if (err) {
                logger.error("Error while executing Query : " + query + " in TradeInstanceDao.prototype.deleteTradeInstance(). \n Error :" + err);
                return cb(err, rows);
            } else {
                logger.info("Successfully executed Query : " + query + " in TradeInstanceDao.prototype.deleteTradeInstance().");
                return cb(err, rows);
            }
    });
};

module.exports = TradeInstanceDao;


