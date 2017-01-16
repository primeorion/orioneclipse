
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
var AccountDao = require('dao/account/AccountDao.js');
var securityDao = require('dao/security/SecurityDao.js');
var modelService = require('service/model/ModelService.js');

var accountDao = new AccountDao();
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
var dynamicModelArbitraryAmount= applicationEnum.dynamicModelArbitraryAmount;
var corporateAction = applicationEnum.corporateAction;

ModelService.prototype.createCorporateActionForSecurity = function (data, cb) {
    logger.info(" create corporate action for security service called (createCorporateActionForSecurity())");
    
    
    securityDao.createCorporateActionForSecurity(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting create corporate action list service (createCorporateActionForSecurity())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        data.id = fetched.insertId;
        securityDao.getCorporateActionByInternalId(data, function(err, rs){
        	if (err) {
                logger.error("Error in getting create corporate action list service (createCorporateActionForSecurity())" + err);
                return cb(err, codes.INTERNAL_SERVER_ERROR);
            }
        	if(rs && rs.length>0){
        		if(corporateAction["SPIN_OFF"] == data.corporateActionTypeId){
        			modelService.reflectSpinOffSecurity(data, function(err, status, rss){
            			if (err) {
                            logger.error("Error in getting create corporate action list service (createCorporateActionForSecurity())" + err);
                            return cb(err, codes.INTERNAL_SERVER_ERROR);
                        }
            			return cb(null, codes.SUCCESS, rs[0]);        		
            		})
        		}else{
        			return cb(null, codes.SUCCESS, rs[0]);
        		}
        	}else{
        		return cb(null, codes.UNPROCESSABLE, {message : messages.securityCorporateActionDoesNotExists});
        	}
        });
    });
};

ModelService.prototype.getCorporateActionListForSecurity = function (data, cb) {
	
    logger.info("Get coporate action list for security service called (getCorporateActionListForSecurity())");
    
    securityDao.getCorporateActionForSecurity(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting model list service (getModelList())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, codes.SUCCESS, fetched);
    });
};

ModelService.prototype.getCorporateActionListForSecurity = function (data, cb) {
	
    logger.info("Get coporate action list for security service called (getCorporateActionListForSecurity())");
    
    securityDao.getCorporateActionForSecurity(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting model list service (getModelList())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, codes.SUCCESS, fetched);
    });
};