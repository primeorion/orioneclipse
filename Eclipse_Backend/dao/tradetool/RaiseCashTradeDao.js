"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var preferenceName=config.orionConstants.raiseCash.preferenceName;
var rebalanceUrl = config.env.prop.rebalanceUrl;
var messages = config.messages;
var request = require("request");
var responseCodes = config.responseCodes;
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var RaiseCashTradeDao = function() {
	
	
}

RaiseCashTradeDao.prototype.getMethodsList = function(data, cb) {

	var connection = baseDao.getConnection(data);

	var query = "CALL getPreferenceOptions(?)";

	connection.query(query, [ preferenceName ], function(err, rows, fields) {
		if (err) {
			logger.error("Error while executing Query : " + query + " in RaiseCashTradeDao.prototype.getMethodsList. parameters: " + preferenceName
					+ " \n Error :" + err);
			return cb(err, rows);
		} else {
			logger.info("Successfully executed Query : " + query + " in RaiseCashTradeDao.prototype.getMethodsList().");

			if (rows.length > 0) {
				return cb(err, rows);
			} else {
				return cb(err, rows);
			}

		}
	});
}

RaiseCashTradeDao.prototype.getSelectedMethodId = function(data, cb) {

	var connection = baseDao.getConnection(data);

	var query = "CALL getGeneralPreferenceValueForPreferenceLevel(?,?,?,?)";

	var firmId = data.firmId;
	var recordId = data.userId;

	connection.query(query, [ preferenceName, 1, recordId, firmId ], function(err, rows, fields) {
		if (err) {
			logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getSelectedMethodId(). parameters: "
					+ preferenceName + ", " + 1 + ", " + recordId + "," + +firmId + " \n Error :" + err);
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

RaiseCashTradeDao.prototype.getPreferenceId=function(data,cb){
	
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

RaiseCashTradeDao.prototype.getAccountPortfolio=function(data, accountId, cb){
	
	var connection=baseDao.getConnection(data);
	
	var query="CALL getAccountPortfolio(?)";
	
	connection.query(query,[accountId],function(err,rows,fields){
		if (err) {
            logger.error("Error while executing Query : " + query + " in RaiseCashTradeDao.prototype.getAccountPortfolio(). parameters: " + accountId+  " \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in RaiseCashTradeDao.prototype.getAccountPortfolio().");
           
            if (rows[0].length > 0) {
                return cb(err, rows[0]);
            } else {
                return cb(err, rows[0]);
            }
        
        }
	});
}

RaiseCashTradeDao.prototype.getAccountType=function(data, accountId, cb){
	
	var connection=baseDao.getConnection(data);
	
	var query="CALL getAccountType(?)";
	
	connection.query(query,[accountId],function(err,rows,fields){
		if (err) {
            logger.error("Error while executing Query : " + query + " in RaiseCashTradeDao.prototype.getAccountType(). parameters: " + accountId+  " \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in RaiseCashTradeDao.prototype.getAccountType().");
           
            if (rows[0].length > 0) {
                return cb(err, rows[0]);
            } else {
                return cb(err, rows[0]);
            }
        
        }
	});
}

module.exports = RaiseCashTradeDao;