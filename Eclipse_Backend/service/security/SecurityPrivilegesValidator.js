"use strict";

var moduleName = __filename;

var request = require("request");
var _ = require("lodash");

var SecurityService = function(){}
module.exports = new SecurityService();

var config = require('config');

var sharedCache = require('service/cache/').shared;
var localCache = require('service/cache/').local;
var logger = require("helper").logger(moduleName);

var utilDao = require('dao/util/UtilDao.js');
var securityDao = require('dao/security/SecurityDao.js');
var CustodianService = require("service/admin/CustodianService.js");
var SecurityConverter = require("converter/security/SecurityConverter.js");
var CustodianSecuritySymbol = require('model/custodian/CustodianSecuritySymbol.js');
var SecurityConverter = require('converter/security/SecurityConverter.js');
var CategoryConverter = require('converter/security/CategoryConverter.js');
var CategoryService = require('service/security/CategoryService.js');
var ClassConverter = require('converter/security/ClassConverter.js');
var ClassService = require('service/security/ClassService.js');
var SubClassConverter = require('converter/security/SubClassConverter.js');
var SubClassService = require('service/security/SubClassService.js');
var SecuritySetService = require('service/security/SecuritySetService.js');
var SecurityTypeService = require("service/security/SecurityTypeService.js");

var cbCaller = require("helper").cbCaller;
var securityTypeService = new SecurityTypeService();
var utilService = new (require('service/util/UtilService'))();
var constants = config.orionConstants;
var messages = config.messages;
var responseCodes = config.responseCode;
var httpResponseCodes = config.responseCodes;
var orionApiResponseKeys = constants.orionApiResponseKey;
var applicationEnum = config.applicationEnum;
var securityStatus = applicationEnum.securityStatus;
var constants = config.orionConstants;

var custodianService = new CustodianService();

SecurityService.prototype.securityPriceUpdatePrivilegeCheck = function(data, cb){
	
	logger.info("securityPriceUpdatePrivilegeCheck()");
	var self = this;
	data.permissionToCheck = "SECURITYPRICE";
	self.genericUpdatePermissionCheck(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if(status != responseCodes.SUCCESS){			
			return cb(null, responseCodes.FORBIDDEN, {message : messages.userDoNotHavePermissionToUpdateSecurityPrice});
		}else{
			return cb(null, responseCodes.SUCCESS, null);
		}
	})
 };
 
 SecurityService.prototype.securityTypeUpdatePrivilegeCheck = function(data, cb){
		
		logger.info("securityTypeUpdatePrivilegeCheck()");
		var self = this;
		data.permissionToCheck = "SECURITYTYPE";
		self.genericUpdatePermissionCheck(data, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			if(status != responseCodes.SUCCESS){				
				return cb(null, responseCodes.FORBIDDEN, {message : messages.userDoNotHavePermissionToUpdateSecurityType});
			}else{
				return cb(null, responseCodes.SUCCESS, null);
			}
		})
	 };
 
 SecurityService.prototype.genericUpdatePermissionCheck = function(data, cb){
		
		logger.info("genericUpdatePermissionCheck()");
		var token = data.token;
		var permissionToCheck = data.permissionToCheck;
		sharedCache.get(token, function (err, data) {
	        if (!!data) {
	            var userLoggedIn;
	            try {
	                userLoggedIn = JSON.parse(data);
	            } catch(err){
	                logger.error("Has privilege failed (genericUpdatePermissionCheck()) " + err);
	                return unauthorisedResponse(res, messages.unauthorized);    
	            }
	            var privilegeMap = userLoggedIn.privileges;
	            var permissionNeedFor = constants.methodParse["PUT"];
	            var moduleToAccess = constants.moduleCodeForPrivileges[permissionToCheck].toLowerCase();
	            if(moduleToAccess in privilegeMap){
	            	var privilege = privilegeMap[moduleToAccess];
	                if (privilege[permissionNeedFor]) {
	                    return cb(null, responseCodes.SUCCESS);
	                }    
	            }
	            return cb(null, responseCodes.FORBIDDEN);
	        }
	    });
};
 