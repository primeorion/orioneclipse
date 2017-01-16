"use strict";

var moduleName = __filename;
var SecurityDao = require('dao/security/SecurityTypeDao.js');
var securityDao = new SecurityDao();
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;


var SecurityService =  function() {}

SecurityService.prototype.getSecurityTypeList = function (data, cb) {
	logger.info("Get security type list service called (getSecurityTypeList())");
    securityDao.getSecurityTypeList(data, function (err, result) {
        if (err) {
            logger.error("Error in getting security type list (getSecurityTypeList())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Security type list returned successfully (getSecurityTypeList())");
        return cb(null, responseCodes.SUCCESS, result);
    });
};

SecurityService.prototype.checkSecurityTypeExistence = function(data, cb){
	logger.info("checking the securityTypeExistence (checkSecurityTypeExistence())");
	
	var temp = {
			reqId : data.reqId,
			id : data.securityTypeId
	}
    securityDao.getSecurityTypeById(temp, function (err, result) {
        if (err) {
            logger.error(" checking securityTypeExistence (checkSecurityTypeExistence())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info(" checking securityTypeExistence (checkSecurityTypeExistence())");
        if(result.length > 0){
        	return cb(null, responseCodes.SUCCESS, result);        	
        }else{
        	return cb(messages.securityTypeIdDoesNotExists, responseCodes.UNPROCESSABLE, result);
        }
    });
}

module.exports = SecurityService;