"use strict";

var ModelSleeveService =  function() {}

var moduleName = __filename;

var _ = require("lodash");

var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var TeamDao = require('dao/admin/TeamDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var modelConverter = require('converter/model/ModelPortfolioConverter.js');
var localCache = require('service/cache').local;
var baseConverter = require('converter/base/BaseConverter.js');
var ModelSleeveDao = require('dao/model/ModelSleeveDao.js');
var modelUtil = require("service/model/ModelUtilService.js");
var PortfolioService = require('service/portfolio/PortfolioService.js');
var portfolioService = new PortfolioService();
var asyncFor = helper.asyncFor;
var applicationEnum = config.applicationEnum;
var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;
var teamDao = new TeamDao();
var modelDao = new ModelDao();
var modelSleeveDao = new ModelSleeveDao();
var modelStatus = config.applicationEnum.modelStatus;
var modelPortfolioStatus = config.applicationEnum.modelPortfolioStatus;  
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;

ModelSleeveService.prototype.getSleevedAccountForModel = function (data, cb) {
    logger.info("Get sleeve for model list service called (getSleevedAccountForModel())");
    
    var self = this;
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;
    modelService.getModel(data, function(err, status, rs){
    	if (err) {
            logger.error("Error in getting sleeve list for model service (getSleevedAccountForModel())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		modelSleeveDao.getAllSleeveAccountsForModel(data, function (err, fetched) {
    			if (err) {
    				logger.error("Error in getting sleeve list service (getSleevedAccountForModel())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}
    			return cb(null, codes.SUCCESS, fetched);
    		});
    	}else{
    		return cb(null, codes.NOT_FOUND, {message : messages.modelNotFound});
    	}
    })
};

ModelSleeveService.prototype.getSleevedAccount = function (data, cb) {
    logger.info("Get portfolio for model list service called (getSleevedAccount())");
    
    var self = this;
  
    modelSleeveDao.getAllSleeveAccounts(data, function (err, fetched) {
		if (err) {
			logger.error("Error in getting model list service (getSleevedAccount())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		return cb(null, codes.SUCCESS, fetched);
	});
};

ModelSleeveService.prototype.assignModelToSleeve = function (data, cb) {
    logger.info("assign model to sleeve service called (assignModelToSleeve())");
    
    var self = this;
    var portfolioEntity = modelConverter.getSleevedAccountEntityFromModelModel(data);
    var tmpObj = {};
	tmpObj.reqId = data.reqId;
	tmpObj.id = data.modelId;
	
    modelService.getModel(tmpObj, function(err, status, rs){
    	if (err) {
			logger.error("Error assign model to sleeve service called (assignModelToSleeve())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	if(rs && rs.length > 0){
    		modelSleeveDao.assignModelToSleevedAccount(portfolioEntity, function(err, rs){
    			if (err) {
    				logger.error("Error assign model to sleeve service called (assignModelToSleeve())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}
    			return cb(err, codes.SUCCESS, {message : messages.modelAssignedToSleevedAccount});
    		})	
    	}else{
    		return cb(null, codes.UNPROCESSABLE, {"messages" : messages.modelNotFound});
    	}
    });
    /*
     * privlege check will come
    */
};

ModelSleeveService.prototype.unassignSubstitutedModelToSleeve = function (data, cb) {
    logger.info("assign model to sleeve service called (assignModelToSleeve())");
    
    var self = this;
    var portfolioEntity = modelConverter.getSleevedAccountEntityFromModelModel(data);
    var tmpObj = {};
	tmpObj.reqId = data.reqId;
	tmpObj.id = data.modelId;
	
	modelSleeveDao.unassignSubstitutedModelToSleevedAccount(portfolioEntity, function(err, rs){
		if (err) {
			logger.error("Error assign model to sleeve service called (assignModelToSleeve())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		return cb(err, codes.SUCCESS, {message : messages.modelAssignedToSleevedAccount});
	})	
};

module.exports = new ModelSleeveService();

var modelService = require('service/model/ModelService.js');
