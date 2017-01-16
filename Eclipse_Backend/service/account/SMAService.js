"use strict";

var AccountService = function () { };
module.exports = new AccountService();
var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var moment = require('moment');
var config = require('config');
var util = require('util');
var messages = config.messages;
var responseCode = config.responseCode;
var localCache = require('service/cache').local;

var AccountDao = require('dao/account/AccountDao.js');

var PortfolioService = require('service/portfolio/PortfolioService.js');
var portfolioService = new PortfolioService();
var modelPortfolioService = require('service/model/ModelPortfolioService.js');
var helper = require("helper");
var accountDao = new AccountDao();
var AccountResponseWithOutHoldingValue = require("model/account/AccountResponseWithOutHoldingValue.js");
var AccountConverter = require("converter/account/AccountConverter.js");
var accountConverter = new AccountConverter();
var cbCaller = helper.cbCaller;
var asyncFor = helper.asyncFor;

AccountService.prototype.removeSmaNode = function (data, cb) {
    var self = this;

    logger.info(" remove Sma Node Service called (removeSmaNode())");
    
    var smaAssetEntity = accountConverter.getSmaAssetEntity(data);
    
	accountDao.deleteSmaNode(smaAssetEntity, function (err, status, result) {
		if (err) {
            logger.error("Error in Accounts list simple Conversion (getAccountsListSimple()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
	    logger.info("removeSmaNode  successfully (removeSmaNode())");
	        return cb(null, responseCode.SUCCESS, result);
	});

};
/*
\	reqId
	portfolioId
	user
	
*/AccountService.prototype.removeSMAForPortfolio = function (data, cb) {
    var self = this;

    logger.info(" remove Sma Node Service called (removeSMAAfterModelChangedForPortfolio())");
    var tmpObj = {};
    tmpObj.reqId = data.reqId;
    tmpObj.id = data.portfolioId;
    tmpObj.user = data.user;
    portfolioService.getAccountsListSimple(tmpObj, function(err, status, rs){
    	if (err) {
            logger.error("Error in Accounts list simple Conversion (getAccountsListSimple()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
    	
    	if(rs && rs.length > 0){
    		
    		asyncFor(rs, function(value, index, next){
    			
    			var tmpObj = {};
    			tmpObj.reqId = data.reqId;
    			tmpObj.accountId = value.id;
    			tmpObj.user = data.user;
    			tmpObj.modelDetailId = data.modelDetailId;
    			self.removeSmaNode(tmpObj, function(err, status, rs){
    				if (err) {
    					logger.error("Error in Accounts list simple Conversion (getAccountsListSimple()) " + err);
    					next(err);
    					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    				}
    				console.log("dsafsdfasdfasdfasdfasdf");
    				next();
    			})
    		}, function(err, rs){
    			return cb(err, status, rs);
    		})
    	}else{
    		return cb(err, responseCode.SUCCESS, {});
    	}
    })
};

AccountService.prototype.removeSMAForModel = function (data, cb) {
    var self = this;

    logger.info(" remove Sma Node Service called (removeSMAForModel())");

    if(data.modelDetailIdsToRemoveFromModelDetail && data.modelDetailIdsToRemoveFromModelDetail.length > 0){
        			asyncFor(data.modelDetailIdsToRemoveFromModelDetail, function(value, index, next){
        				var tmpObj = {};
            			tmpObj.reqId = data.reqId;
            			tmpObj.id = data.id;
            			tmpObj.user = data.user;
            			tmpObj.modelDetailId = value.modelDetailId;
        				self.removeSmaNode(tmpObj, function(err, status, rs){
        					if (err) {
            					logger.error("Error in Accounts list simple Conversion (getAccountsListSimple()) " + err);
            					next(err);
            					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            				}
            				console.log("dsafsdfasdfasdfasdfasdf");
            				next();
        				})
        			}, function(err, rs){
        				return cb(err, responseCode.SUCCESS, {});
            		});
    }else{
    	return cb(null, responseCode.SUCCESS, {});
    }
};

