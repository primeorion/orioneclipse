"use strict";

var moduleName = __filename;
var async = require('async');
var config = require('config');
var casting = require('casting');
var messages = config.messages;
var constants = config.orionConstants;
var responseCode = config.responseCodes;
var localCache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var utilFunctions = require('dao/util/UtilDao');
var baseDao = require('dao/BaseDao');
var LOCATION_SETTING = 'location_Setting';
var utilService = new(require('service/util/UtilService'))();
var Promise = require("bluebird");
var _ = require("lodash");
const number = 5; //this const will send these many requests async in 1 time to DB for simple analysis
var enums = config.applicationEnum;
var notificationService = new(require("service/notification/NotificationService.js"))();
var poolCluster = require('dao/dbpool/Init.js').poolCluster;
var localCache = require('service/cache').local;
var unique = require('helper').uniqueIdGenerator;
var full_analysis_in_progress = [];
 var rebalanceUrl = config.env.prop.rebalanceUrl + "postImportAnalysis";
const http = require('http');
var Client = require('node-rest-client').Client; 
var client = new Client();
var dbConnection = require('./../../middleware/DBConnection.js');
var ImportLogDao = new(require('dao/import_log/ImportLogDao.js'))();

var AnalysisDao = function() {};
/** 
* Calling SP to analyze full import
**/
AnalysisDao.prototype.fullAnalysis = function(data, cb) {
  return new Promise(function(resolve, reject) {      
    logger.info("Full Analysis Started!!!")    
    try{
      var reqId = unique.get(),
      firmId,
      cacheObject = {},      
      body = {
        type: messages.notificationFullAnalysisType,
        message: messages.fullImportError,
        status: messages.importErrorStatus,
        progress: 100
      };
      if(data.req != null){
        firmId = data.req.data.user.firmId;
        data.req.data.reqId = reqId; 
        data = data.req;           
      }
      else{        
        firmId = data.user.firmId;
        data.data = {reqId: reqId, user: data.user};    
      }      
      localCache.put(reqId , cacheObject);
      data.reqId = reqId;
      // data.user = {firmId: firmId};   
      if(_.includes(full_analysis_in_progress, firmId)) {
        localCache.del(reqId);
        logger.info("Full POST import analysis initiated again when analysis is still in progress. Firm ID: " + firmId);
        resolve("Analysis already in progress!!!");
      }else{
        logger.info("Full POST import analysis started");
        resolve("Analysis Started!!!");
        full_analysis_in_progress.push(firmId);
        var t1, t2;
        if(data.url){
        	data.tempUrl = data.url + "(analysis)";
        }
        getDbConnection(data)
        .then(function(connection_resp){
          t1 = new Date();              
          return allPortfolioAnalysis(data);          
        })
        .then(function(portfolio_analyis_resp){
          logger.debug("Portfolio Analytics SP Time: " + (new Date() - t1)/1000 + " seconds")
          t1 = new Date();
          return allAccountAnalysis(data);
        })   
        .then(function(account_analysis_resp){
          logger.debug("Account Analytics SP Time: " + (new Date() - t1)/1000 + " seconds")
          t1 = new Date();
          return allHoldingAnalysis(data);
        })
        .then(function(holding_analysis_resp){
          logger.debug("Holding Analytics SP Time: " + (new Date() - t1)/1000 + " seconds")          
          return getPortfolioAnalysisIds({reqId:reqId, user: data.user, portfolio_ids: undefined});
        })
        .then(function(portfolio_ids){                 
          return rebalancerAnalysis({reqId: reqId, user: data.user, portfolio_ids: portfolio_ids, percentage: 60, analysis: 1 });
        })
        .then(function(response){         
          if(data.end_session == null)
            return 1;
          else{
            // Log ETL import start analytics time in a table importLog
            logger.info("Updating end analytics time of import log for session: " + data.sessionId);
            data.column_name = 'endAnalyticsTime';
            data.reason = "Data import process successfully finished!!!";
            data.etl_status = "Completed";
            ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
              if(err){
                logger.error("Not able to Update endAnalyticsTime for import session: " + data.session);
              }
              return 1;
            });
          }
        })
        .then(function(importLogDetails){          
          logger.info("Releasing DB Connection!!!");
          dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 201}, function(err, resp){});
          full_analysis_in_progress.splice(full_analysis_in_progress.indexOf(firmId),1);
          return 1;
        })    
        .catch(function(error) {       
          if(data.end_session != null){            
            // Log ETL import start analytics time in a table importLog
            data.column_name = 'endAnalyticsTime';
            data.reason = error;
            data.etl_status = "Failed";
            ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
              if(err){
                logger.error("Not able to Update endAnalyticsTime for import session: " + data.session);
              }              
            });
          }    

          data.completion = true;      
          sendAnalysisNotification(data, body, function(err, resp){            
            logger.info("Releasing DB Connection!!!");
            dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 401}, function(err, resp){})             
          });
                
          logger.error("Error in full import analysis in function AnalysisDao.fullAnalysis(). \n Error :" + error + "\n Error STACK: " + error.stack);    
          full_analysis_in_progress.splice(full_analysis_in_progress.indexOf(firmId),1);         
        });
      }
    }              
    catch(err){
      if(data.end_session != null){        
        // Log ETL import start analytics time in a table importLog
        data.column_name = 'endAnalyticsTime';
        data.reason = err;
        data.etl_status = "Failed";
        ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
          if(err){
            logger.error("Not able to Update endAnalyticsTime for import session: " + data.session);
          }          
        });
      }

      localCache.del(reqId);
      logger.error("Error in full import analysis in function AnalysisDao.fullAnalysis(). \n Error :" + err);
      full_analysis_in_progress.splice(full_analysis_in_progress.indexOf(firmId),1);
      data.completion = true;    
      sendAnalysisNotification(data, body, function(err, resp){});
    } 
  });
}

/** 
* Calling SP to analyze partial portfolio on CRUD operations performed on (Portfolio, Accout, Preference, Model, Price, Security)
**/
AnalysisDao.prototype.partialAnalysis = function(data, cb) {
  return new Promise(function(resolve, reject) {
    var firmId = data.req.data.user.firmId,
    cacheObject = {},
    body = {
      type: messages.notificationFullAnalysisType,
      message: messages.partialImportError,
      status: messages.importErrorStatus,
      progress: 100
    };
    if(_.includes(full_analysis_in_progress, firmId)){
      logger.info("Full POST import analysis initiated again when analysis is still in progress. Firm ID: " + firmId);
      resolve ("Full Analysis in Progress!!!");
    }else{
      resolve("Analysis Started!!!");  
      try{
        logger.info("Delta Run analysis started!!! \n URL : " + data.url);      
        var reqId = unique.get();
        data.req.data.reqId = reqId;    
        localCache.put(reqId , cacheObject);
        data.reqId = reqId;
        data.user = data.req.data.user;
        if(data.req.url){
        	data.req.tempUrl = data.req.url + "(analysis)";
        }
        data.user = data.req.data.user;  
        getDbConnection(data.req)

        .then(function(connection_resp){
          delete data.req;      
          return getDataForAnalysis(data);
        })        
        .then(function(resp){            
          if(resp != null){                           

            resp.portfolio_ids = resp.portfolio_ids.split(",").map(Number);            
            resp.portfolio_ids = _.remove(resp.portfolio_ids, function(n){return n != 0});            
            resp.holding_ids = resp.holding_ids.split(",").map(Number);
            resp.holding_ids = _.remove(resp.holding_ids, function(n){return n != 0});
            resp.account_ids = resp.account_ids.split(",").map(Number);
            resp.account_ids = _.remove(resp.account_ids, function(n){return n != 0});           
                      
            var total = (resp.portfolio_ids.length) * 2 + resp.account_ids.length + resp.holding_ids.length;
         
            portfolioAnalysis({reqId:reqId, user: data.user, portfolio_ids: resp.portfolio_ids, total: total, percentage: 0})
            .then(function(response){                            
              return accountAnalysis({reqId: reqId, user: data.user, account_ids: resp.account_ids, total: total, percentage: (resp.portfolio_ids.length / total)*100 , resp: resp});
            })
            .then(function(response){              
              return holdingAnalysis({reqId: reqId, user: data.user, holding_ids: resp.holding_ids, total: total, percentage: ((resp.portfolio_ids.length + resp.account_ids.length) / total) * 100});
            })
            .then(function(response){                             
              return getPortfolioAnalysisIds({reqId:reqId, user: data.user, portfolio_ids: resp.portfolio_ids});
            })
            .then(function(portfolio_ids){                                        
              return rebalancerAnalysis({reqId: reqId, user: data.user, portfolio_ids: portfolio_ids, percentage: ((total - resp.portfolio_ids.length) / total) * 100, analysis: 2 });
            })
            .then(function(response){
              logger.info("Releasing DB Connection!!!"); 
              return dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 201}, function(err, resp){});              
            })
            .catch(function(error) {                           
              logger.error("Error in delta run import analysis in function AnalysisDao.partialAnalysis(). \n Error :" + error + "\n Error STACK: " + error.stack);
              sendAnalysisNotification(data, body, function(err, resp){
                logger.info("Releasing DB Connection!!!");
                return dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 401}, function(err, resp){});                 
              });     
            });
          }else{
            logger.info("Releasing DB Connection!!!"); 
            return dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 201}, function(err, resp){});            
          }               
        }).catch(function(error) {           
          logger.error("Error in delta run import analysis in function AnalysisDao.partialAnalysis(). \n Error :" + error + "\n Error STACK: " + error.stack);
          data.completion = true;    
          sendAnalysisNotification(data, body, function(err, resp){
            logger.info("Releasing DB Connection!!!");
            return dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 401}, function(err, resp){});
          });   
        });  
      }catch(err){
        logger.error("Error in delta run import analysis in function AnalysisDao.partialAnalysis(). \n Error :" + err); 
        data.completion = true;    
        sendAnalysisNotification(data, body, function(err, resp){
          logger.info("Releasing DB Connection!!!");
          return dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, {statusCode: 401}, function(err, resp){});
        });
      }            
    }      
  });
}

/** 
* Get DB Connection
**/

var getDbConnection = function(req){ 
  return new Promise(function(resolve, reject) {
  logger.info("Getting new db connection for analysis!!!");           
    baseDao.getDbConnection(req, function(err, resp){
      if(err)
        reject(err);
      else
        resolve("Success!!!")
    });
  });
}

/** 
* Send Analysis Notification via socket i/o
**/
var sendAnalysisNotification = function(data, body, cb) {
  logger.info("Sending analysis notification!!!");    
  var notificationInputData = {
    reqId: data.reqId,
    user: data.user,
    subject: messages.importSubject,
    body: body,
    code: enums.notificationCategoryType.DATA_IMPORT
  };  
  if (data.completion){    
    var notInputData = {
    reqId: data.reqId,
    user: data.user,
    subject: messages.importSubject,
    body: body.message,
    code: enums.notificationCategoryType.DATA_IMPORT
  }; 
    notificationService.createAndSendNotification(notInputData, function(err,result){
      if(err){
        logger.debug("error in send notification in function AnalysisDao.sendAnalysisNotification()");
        return cb(err, null);
      }else{
        return cb(null, responseCode.CREATED);
      }    
    });
  }
  notificationService.sendNotification({user:notInputData.user,processNotification: notificationInputData.body, code: notificationInputData.code}, function(err,result){
    if(err){
      logger.debug("error in send notification in function AnalysisDao.sendAnalysisNotification()");
      if(!data.completion)
        return cb(err, null);
    }else{
      if(!data.completion)
        return cb(null, responseCode.CREATED);
    }    
  });  
}

/** 
* All Portfolio Analysis
**/
var allPortfolioAnalysis = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Mass portfolio analysis started");    
    var firmConnection = baseDao.getConnection(data), 
    body;
    var query = "CALL insertUpdateAnalyticsForAllPortfolios";
    logger.debug("Query Ran:", query);
    firmConnection.query(query,function(err, rows, fields) {
      if (err) {
        logger.error("Error while executing Query : " + query + " in AnalysisDao.allPortfolioAnalysis(). \n Error :" + err);
        reject(err);
      } else {   
        data.completion = false;     
        body = {
          type: messages.notificationFullAnalysisType,
          message: messages.notificationFullAnalysisMessage,
          status: messages.notificationInProgressStatus,
          progress: 15  
        }
        sendAnalysisNotification(data, body, function(err, resp){
          if(err)
            logger.error("Error while sending notifications in AnalysisDao.allPortfolioAnalysis(). \n Error :" + err);
          return 1;
        });
        resolve("success");
      }
    });
  });
}

/** 
* All Account Analysis
**/
var allAccountAnalysis = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Mass account analysis started");
    var firmConnection = baseDao.getConnection(data),
    body;
    var query = "CALL insertUpdateAnalyticsForAllAccounts";
    logger.debug("Query Ran:", query);
    firmConnection.query(query,function(err, rows, fields) {
      if (err) {
        logger.error("Error while executing Query : " + query + " in AnalysisDao.allAccountAnalysis(). \n Error :" + err);
        reject(err);
      } else {
        data.completion = false;
        body = {
          type: messages.notificationFullAnalysisType,
          message: messages.notificationFullAnalysisMessage,
          status: messages.notificationInProgressStatus,
          progress: 35
        }
        sendAnalysisNotification(data, body, function(err, resp){
          if(err)
            logger.error("Error while sending notifications in AnalysisDao.allAccountAnalysis(). \n Error :" + err);
          return 1;
        });
        resolve("success");
      }
    });
  });
}

/** 
* All Holding Analysis
**/
var allHoldingAnalysis = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Mass holding analysis started");
    var firmConnection = baseDao.getConnection(data),
    body;
    var query = "CALL insertUpdateAnalyticsForAllHoldings";
    logger.debug("Query Ran:", query);
    firmConnection.query(query,function(err, rows, fields) {
      if (err) {
        logger.error("Error while executing Query : " + query + " in AnalysisDao.allHoldingAnalysis(). \n Error :" + err);
        reject(err);
      } else {
        data.completion = true;
        body = {
          type: messages.notificationFullAnalysisType,
          message: messages.notificationFullAnalysisMessage,
          status: messages.notificationInProgressStatus,
          progress: 60
        }
        sendAnalysisNotification(data, body, function(err, resp){
          if(err){
            logger.error("Error while executing Query : " + query + " in AnalysisDao.allHoldingAnalysis(). \n Error :" + err);
            reject(err)
          }
          else
            resolve("success");
        });        
      }
    });
  });
}

/** 
* Limited Portfolio Analysis
**/
var portfolioAnalysis = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Portfolio analysis started");
    if(data.portfolio_ids.length == 0)
      resolve("success");
    else{
      try{
        var firmConnection = baseDao.getConnection(data);
        var query = "CALL insertUpdateAnalyticsForPortfolio(?)",
        body;
        var ids = data.portfolio_ids.slice(0,number),
        portfolio_length = data.portfolio_ids.length,
        last_lot = false,
        loop_iteration = 0,
        num = number;

        if(portfolio_length < number){
          last_lot = true;
          num = portfolio_length;
        }
        var loop = function(ids, last_lot){
          num = last_lot ? ids.length : num;
          loop_iteration++;
          if(ids.length > 0){
            _.map(ids, function(id, index){
              logger.debug("Query Ran:", query +  ". Parameters: " + id);
              firmConnection.query(query, id, function(err, rows, fields) {
                if (err) {
                  logger.error("Error while executing Query : " + query + " in AnalysisDao.portfolioAnalysis(" + id + "). \n Error :" + err);
                  reject(err);
                } else {                    
                  if(index + 1 == num){
                    if(last_lot){
                      var percentage_completion = (portfolio_length / data.total) * 100;
                      data.completion = false;
                      body = {
                        type: messages.notificationFullAnalysisType,
                        message: messages.notificationPartialAnalysisMessage,
                        status: messages.notificationInProgressStatus,                        
                        progress: percentage_completion.toFixed(2)
                      }
                      sendAnalysisNotification(data, body, function(err, resp){
                        if(err)
                          logger.error("Error while sending notifications in AnalysisDao.portfolioAnalysis(). \n Error :" + err);
                        return 1;
                      });
                      resolve("success");
                    }
                    else{
                      var percentage_completion = ((number * loop_iteration) / data.total) * 100;
                      ids = [];
                      ids = data.portfolio_ids.slice(number * loop_iteration, number * (loop_iteration+1));

                      if(((portfolio_length / number)-1) > loop_iteration)               
                        return loop(ids, false);
                      else
                        return loop(ids, true);
                      data.completion = false;
                      body = {
                        type: messages.notificationFullAnalysisType,
                        message: messages.notificationPartialAnalysisMessage,
                        status: messages.notificationInProgressStatus,
                        progress: percentage_completion.toFixed(2)
                      }
                      sendAnalysisNotification(data, body, function(err, resp){
                        if(err)
                          logger.error("Error while sending notifications in AnalysisDao.portfolioAnalysis(). \n Error :" + err);
                        return 1;
                      });
                    }
                  }            
                }
              });
            });
          }else{
            resolve("success");
          }                
        }
        loop(ids, last_lot);    
      }catch(err){
        logger.error("Error while executing Query : " + query + " in AnalysisDao.portfolioAnalysis(). \n Error :" + err);
        reject(err);
      }
          
    }      
  });
}

/** 
* Limited Account Analysis
**/
var accountAnalysis = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Account analysis started");  
    if(data.account_ids.length == 0)
      resolve("success");
    else{
      try{
        var firmConnection = baseDao.getConnection(data);
        var query = "CALL insertUpdateAnalyticsForAccount(?)",
        body;
        var ids = data.account_ids.slice(0,number),
        account_length = data.account_ids.length,
        last_lot = false,
        loop_iteration = 0,
        num = number;
        
        if(account_length < number){
          num = account_length;
          last_lot = true;
        }
        var loop = function(ids, last_lot){
          num = last_lot ? ids.length : num;
          loop_iteration++;
          if(ids.length > 0){
            _.map(ids, function(id, index){
              logger.debug("Query Ran:", query +  ". Parameters: " + id);
              firmConnection.query(query, id, function(err, rows, fields) {
                if (err) {
                  logger.error("Error while executing Query : " + query + " in AnalysisDao.accountAnalysis(" + id + "). \n Error :" + err);
                  reject(err);
                } else {
                  if(index + 1 == num){
                    if(last_lot){
                      var percentage_completion = data.percentage + (account_length / data.total) * 100;
                      data.completion = false;
                      body = {
                        type: messages.notificationFullAnalysisType,
                        message: messages.notificationPartialAnalysisMessage,
                        status: messages.notificationInProgressStatus,
                        progress: percentage_completion.toFixed(2)
                      }
                      sendAnalysisNotification(data, body, function(err, resp){
                        if(err)
                          logger.error("Error while sending notifications in AnalysisDao.accountAnalysis(). \n Error :" + err);
                        return 1;
                       });
                      resolve("success");
                    }
                    else{
                      var percentage_completion = data.percentage + ((number * loop_iteration) / data.total) * 100;
                      data.completion = false;
                      body = {
                        type: messages.notificationFullAnalysisType,
                        message: messages.notificationPartialAnalysisMessage,
                        status: messages.notificationInProgressStatus,
                        progress: percentage_completion.toFixed(2)
                      }
                      sendAnalysisNotification(data, body, function(err, resp){
                        if(err)
                          logger.error("Error while sending notifications in AnalysisDao.accountAnalysis(). \n Error :" + err);
                        return 1;
                      });
                      ids = data.account_ids.slice(number * loop_iteration, number * (loop_iteration+1));
                      if(((account_length / number) - 1) > loop_iteration)               
                        loop(ids, false);
                      else
                        loop(ids, true);
                    }
                  }            
                }
              });
            }) 
          }else{
            resolve("success");
          }     
        }
        loop(ids, last_lot);  
      }
      catch(err){
        logger.error("Error while executing Query : " + query + " in AnalysisDao.accountAnalysis(). \n Error :" + err);
        reject(err);
      }
    }     
  });
}

/** 
* Limited Holding Analysis
**/
var holdingAnalysis = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Holding analysis started");    
    if(data.holding_ids.length == 0)
      resolve("success");
    else{
      try{
        var firmConnection = baseDao.getConnection(data);
        var query = "CALL insertUpdateAnalyticsForHolding(?)",
        body;
        var ids = data.holding_ids.slice(0,number),
        holding_length = data.holding_ids.length,
        last_lot = false,
        loop_iteration = 0,
        num = number;
        if(holding_length < number){
          num = holding_length;
          last_lot = true;
        }
        var loop = function(ids, last_lot){
          num = last_lot ? ids.length : num;
          loop_iteration++;
          if(ids.length > 0){
            _.map(ids, function(id, index){
              logger.debug("Query Ran:", query +  ". Parameters: " + id);
              firmConnection.query(query, id, function(err, rows, fields) {
                if (err) {
                  logger.error("Error while executing Query : " + query + " in AnalysisDao.holdingAnalysis(" + id + "). \n Error :" + err);
                  reject(err);
                } else {
                  if(index + 1 == num){
                    if(last_lot){
                      var percentage_completion = data.percentage + (holding_length / data.total) * 100;     
                      body = {
                        type: messages.notificationFullAnalysisType,
                        message: messages.notificationPartialAnalysisMessage,
                        status: messages.notificationInProgressStatus,
                        progress: percentage_completion.toFixed(2)
                      }
                      sendAnalysisNotification(data, body, function(err, resp){
                        if(err){
                          logger.error("Error while sending notifications in AnalysisDao.holdingAnalysis(). \n Error :" + err);
                          reject(err)
                        }
                        else
                          resolve("success");
                      });                      
                    }
                    else{
                      var percentage_completion = data.percentage + ((number * loop_iteration) / data.total) * 100;
                      data.completion = false;
                      body = {
                        type: messages.notificationFullAnalysisType,
                        message: messages.notificationPartialAnalysisMessage,
                        status: messages.notificationInProgressStatus,
                        progress: percentage_completion.toFixed(2)
                      }
                      sendAnalysisNotification(data, body, function(err, resp){
                        if(err)
                          logger.error("Error while sending notifications in AnalysisDao.holdingAnalysis(). \n Error :" + err);
                        return 1;
                      });
                      ids = data.holding_ids.slice(number * loop_iteration, number * (loop_iteration+1));                      
                      if(((holding_length / number)-1) > loop_iteration)               
                        loop(ids, false);
                      else
                        loop(ids, true);
                    }
                  }            
                }
              });
            }) 
          }else{
            resolve("success");
          }     
        }
        loop(ids, last_lot);  
      }catch(err){
        logger.error("Error while executing Query : " + query + " in AnalysisDao.holdingAnalysis(). \n Error :" + err);
        reject(err);
      }      
    }         
  });
}

/** 
* Get Data for partial analysis
**/
var getDataForAnalysis = function(data){
  return new Promise(function(resolve, reject) {
    var firmConnection = baseDao.getConnection(data);
    var query = "CALL getDataForAnalysis(?, ?)"; 
    logger.debug("Query Ran:", query +  ". Parameters: " + [data.model, data.model_id]);      
    firmConnection.query(query, [data.model, data.model_id], function(err, rows, fields) {        
      if (err) {
        logger.error("Error while executing Query: " + query + " with parameters: " + JSON.stringify(data) + " in AnalysisDao.prototype.getDataForAnalysis(). \n Error :" + err);
        reject(err);
      } else {
        logger.info("Execute query to get data for analysis!!! Query: " + query + [data.model, data.model_id]);
        try{
          rows = rows[0][0];
          if (rows != null){
            delete rows["id"];
            rows["holding_ids"] = rows.holding_ids || '';
            rows["account_ids"] = rows.account_ids || '';
            rows["portfolio_ids"] = rows.portfolio_ids || '';
            resolve(rows);  
          }else
            resolve(rows);
          
        }catch(err){
          logger.error("Error in try catch of AnalysisDao.prototype.getDataForAnalysis(). \n Error :" + err);
          reject(err);
        }        
      }
    });
  });
}

/** 
* Get Portfolio Ids from portfolio analysis table
**/
var getPortfolioAnalysisIds = function(data){
  return new Promise(function(resolve, reject) {    
    var query, condition = '';
    var firmConnection = baseDao.getConnection(data);      
    if(typeof(data.portfolio_ids) == 'object' && data.portfolio_ids.length == 0){
      // Get all portfolio ids from portfolio analysis table
      resolve(null);
    }else if(data.portfolio_ids != undefined){
      condition += ' where portfolioId in (' + data.portfolio_ids.join(",") + ')';     
    }
    logger.info("Getting Portfolio Ids from portfolioAnalysis table.");
    query = "SELECT GROUP_CONCAT(distinct(portfolioId)) as portfolio_ids FROM portfolioAnalytics" + condition;
    logger.debug("Query Ran:", query);
    firmConnection.query(query, function(err, rows, fields) {        
      if (err) {
        logger.error("Error while executing Query: " + query + ". \n Error :" + err);
        reject(err);
      } else {
        logger.info("Execute query to get portfolio id from portfolio analysis table!!! Query: " + query);
        try{            
          rows = rows[0].portfolio_ids;            
          if(rows == null)
            resolve(null);
          else
            resolve(rows.split(",").map(Number));            
        }catch(err){
          logger.error("Error in try catch of AnalysisDao.prototype.getDataForAnalysis(). \n Error :" + err);
          reject(err);
        }        
      }
    });
  });
}


/** 
* Run Rebalancer for analysis
**/
var rebalancerAnalysis = function(data){
  return new Promise(function(resolve, reject) {
    var body, 
    error_occured = false;    
    if(data.portfolio_ids == null){
      body = {
        type: messages.notificationFullAnalysisType,
        message: messages.notificationCompletionAnalysisMessage,
        status: messages.notificationCompletedStatus,
        progress: 100
      };
      data.completion = true;
      sendAnalysisNotification(data, body, function(err, resp){
        if(err){
          logger.error("Error while sending notifications in AnalysisDao.rebalancerAnalysis(). \n Error :" + err);
          reject(err)
        }
        else
          resolve("success");
      });
    }else{
      var portfolio_length = data.portfolio_ids.length,
      percentage = data.percentage,
      firmId = data.user.firmId,
      index_count = 0;
      

      _.map(data.portfolio_ids, function(portfolio_id){ 
       var args = {
          data: { 
            portfolioId: portfolio_id,
            firmId: firmId
          },
          headers: { "Content-Type": "application/json" }
        }
        logger.debug("Rebalancer POST API called:", rebalanceUrl + ". Args: " + JSON.stringify(args));
        client.post(rebalanceUrl, args, function(dta, response) {          
          index_count += 1;
          if(response.statusCode > 210){
            logger.error("Error while HTTP POST request to rebalancer in AnalysisDao.rebalancerAnalysis().\nURL: " + rebalanceUrl + "\n ARGS: " + JSON.stringify(args) + "\n Status Code :" + response.statusCode + "\n  Data in response: " + JSON.stringify(dta));  
            if(index_count == portfolio_length){              
              reject("Status Code: " + response.statusCode);
            } 
            error_occured = true;         
          }else{   
            logger.info("SUCCESS HTTP POST request to rebalancer in AnalysisDao.rebalancerAnalysis().\n URL: " + rebalanceUrl + "\n ARGS: " + JSON.stringify(args) + "\n Status Code :" + response.statusCode + "\n  Data in response: " + JSON.stringify(dta));                        
            var percentage_completion = data.percentage + ((index_count / portfolio_length) * (100 - data.percentage));
            if(index_count == portfolio_length){
              if(error_occured)
                reject("ERROR");
              else{                
                body = {
                  type: messages.notificationFullAnalysisType,
                  message: messages.notificationCompletionAnalysisMessage,
                  status: messages.notificationCompletedStatus,
                  progress: 100
                };
                data.completion = true;
                sendAnalysisNotification(data, body, function(err, resp){
                  if(err){
                    logger.error("Error while sending notifications in AnalysisDao.rebalancerAnalysis(). \n Error :" + err);
                    reject(err);
                  }
                  else
                    resolve("success");
                });
              }              
            }else{
              body = {
                type: messages.notificationFullAnalysisType,
                message: data.analysis == 1 ? messages.notificationFullAnalysisMessage : messages.notificationPartialAnalysisMessage,
                status: messages.notificationInProgressStatus,                
                progress: percentage_completion.toFixed(2)
              };
              sendAnalysisNotification(data, body, function(err, resp){
                if(err){
                  logger.error("Error while sending notifications in AnalysisDao.rebalancerAnalysis(). \n Error :" + err);                  
                }
                return 1;
              });
            }            
            
          }
        }).on('error', function(err){
          logger.error("Error while http request to rebalancer in AnalysisDao.rebalancerAnalysis(). \n Error :" + err);
          reject(err);
        });      
      });  
    }  
  });
}

module.exports = AnalysisDao;