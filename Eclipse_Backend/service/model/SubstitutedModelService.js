"use strict";

var moduleName = __filename;

var ModelService =  function() {}
module.exports = new ModelService();

var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var TeamDao = require('dao/admin/TeamDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var modelConverter = require('converter/model/ModelConverter.js');
var localCache = require('service/cache').local;
var baseConverter = require('converter/base/BaseConverter.js');
var _ = require("lodash");
var modelUtil = require("service/model/ModelUtilService.js");
var CategoryService = require("service/security/CategoryService.js");
var ClassService = require("service/security/ClassService.js");
var SubClassService = require("service/security/SubClassService.js");
var SecuritySetService = require("service/security/SecuritySetService.js");
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var utilService = new (require('service/util/UtilService'))();

var sharedCache = require('service/cache/').shared;
var applicationEnum = config.applicationEnum;
var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;
var teamDao = new TeamDao();
var modelDao = new ModelDao();
var portfolioDao = new PortfolioDao();
var modelValidationMessages = messages.modelValidations;
var modelStatus = config.applicationEnum.modelStatus;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var privilegeForModelApproval = applicationEnum.modelApprovePrivilege;

ModelService.prototype.getSubstituteModelListForModel = function (data, cb) {
    logger.info("Get substitute model list service called (getSubstituteModelListForModel())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.getSubstituteModelListForModel(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting substitute model list service (getSubstituteModelListForModel())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, codes.SUCCESS, fetched);
    });
};

ModelService.prototype.createSubsituteModel = function (data, cb) {
    logger.info(" Create substitute Model (createSubsituteModel())");
    
    modelDao.getDashboardSummary(data, function(err, rs){
    	if (err) {
            logger.error("Error (createSubsituteModel())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	try{    		
    		var json = {};
    		var totalModelRS = rs[0][0];
    		var statusBasedRS = rs[1][0];
    		var OUTRS = rs[2][0];
    		json.totalNumberOfModels = totalModelRS.total;
    		json.newModels = totalModelRS.new;
    		json.existingModels = totalModelRS.existing;
    		
    		json.approvedModels = statusBasedRS.approved;
    		json.waitingForApprovalModels = statusBasedRS.waitingForApproval;
    		json.draftModels = statusBasedRS.draft;
    		json.notActive = statusBasedRS.nonActiveModels;
    		json.analyticsOn = statusBasedRS.lastUpdateDate;
    		
    		json.OUBalanceModels = OUTRS.outModel;
    		cb(null, codes.SUCCESS, json);
    	}catch(e){
    		 return cb(e, codes.INTERNAL_SERVER_ERROR);
    	}
    });
    
};