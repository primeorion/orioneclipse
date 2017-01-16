"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var preferenceName=config.orionConstants.spendCash.preferenceName;
var rebalanceUrl = config.env.prop.rebalanceUrl;
var messages = config.messages;
var request = require("request");
var responseCodes = config.responseCodes;
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var spendCashTradeDao = function() {
	
	
}

spendCashTradeDao.prototype.getMethodsList=function(data,cb){
	
	var connection = baseDao.getConnection(data);
		
	 var query = "CALL getPreferenceOptions(?)";
	 
	 
	 connection.query(query,[preferenceName], function(err, rows, fields) {
	        if (err) {
	            logger.error("Error while executing Query : " + query + " in spendCashTradeDao.prototype.getMethodsList. parameters: " + preferenceName + " \n Error :" + err);
	            return cb(err, rows);
	        } else {
	            logger.info("Successfully executed Query : " + query + " in spendCashTradeDao.prototype.getMethodsList().");
	           
	            if (rows.length > 0) {
	                return cb(err, rows);
	            } else {
	                return cb(err, rows);
	            }
	        
	        }
	 });
}

spendCashTradeDao.prototype.getSelectedMethodId=function(data,cb){
	
	 var connection = baseDao.getConnection(data);
	  
	
	 var query = "CALL getGeneralPreferenceValueForPreferenceLevel(?,?,?,?)";
	 
	 
	 var firmId=data.firmId;
	 var recordId=data.userId;
	
	 connection.query(query,[preferenceName,1,recordId,firmId], function(err, rows, fields) {
	        if (err) {
	            logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getSelectedMethodId(). parameters: " + preferenceName + ", " + 1 + ", "+recordId+","+ + firmId + " \n Error :" + err);
	            return cb(err, rows);
	        } else {
	            logger.info("Successfully executed Query : " + query + " in PreferencesDao.prototype.getSelectedMethodId().");
	           
	            if (rows.length > 0) {
	                return cb(err, rows);
	            } else {
	                return cb(err, rows);
	            }
	        
	        }
	 });
}

spendCashTradeDao.prototype.getPreferenceId=function(data,cb){
	
	var connection=baseDao.getConnection(data);
	
	var query="select id from preferenceOption po where po.optionName = ?";
	
	connection.query(query,[data.selectMethod],function(err,rows,fields){
		if (err) {
            logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getPreferenceId(). parameters: " + data.selectMethod +  " \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in PreferencesDao.prototype.getPreferenceId().");
           
            if (rows.length > 0) {
                return cb(err, rows);
            } else {
                return cb(err, rows);
            }
        
        }
	});
}

spendCashTradeDao.prototype.getAccountPortfolio=function(data, accountId, cb){
	
	var connection=baseDao.getConnection(data);
	
	var query="CALL getAccountPortfolio(?)";
	
	connection.query(query,[accountId],function(err,rows,fields){
		if (err) {
            logger.error("Error while executing Query : " + query + " in spendCashTradeDao.prototype.getAccountPortfolio(). parameters: " + accountId+  " \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in spendCashTradeDao.prototype.getAccountPortfolio().");
           
            if (rows[0].length > 0) {
                return cb(err, rows[0]);
            } else {
                return cb(err, rows[0]);
            }
        
        }
	});
}

spendCashTradeDao.prototype.getAccountType=function(data, accountId, cb){
	
	var connection=baseDao.getConnection(data);
	
	var query="CALL getAccountType(?)";
	
	connection.query(query,[accountId],function(err,rows,fields){
		if (err) {
            logger.error("Error while executing Query : " + query + " in spendCashTradeDao.prototype.getAccountType(). parameters: " + accountId+  " \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in spendCashTradeDao.prototype.getAccountType().");
           
            if (rows[0].length > 0) {
                return cb(err, rows[0]);
            } else {
                return cb(err, rows[0]);
            }
        
        }
	});
}

module.exports = spendCashTradeDao;