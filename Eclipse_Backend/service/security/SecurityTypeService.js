"use strict";

var moduleName = __filename;

var SecurityConverter = require('converter/security/SecurityConverter.js');
var SecurityDao = require('dao/security/SecurityTypeDao.js');
var securityTypeDao = new SecurityDao();
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;


var SecurityService =  function() {}

SecurityService.prototype.getSecurityTypeList = function (data, cb) {
	logger.info("Get security type list service called (getSecurityTypeList())");
	securityTypeDao.getSecurityTypeList(data, function (err, result) {
        if (err) {
            logger.error("Error in getting security type list (getSecurityTypeList())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
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
	securityTypeDao.getSecurityTypeById(temp, function (err, result) {
        if (err) {
            logger.error(" checking securityTypeExistence (checkSecurityTypeExistence())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info(" checking securityTypeExistence (checkSecurityTypeExistence())");
        if(result.length > 0){
        	return cb(null, responseCodes.SUCCESS, result);        	
        }else{
        	return cb(messages.securityTypeIdDoesNotExists, responseCodes.UNPROCESSABLE, result);
        }
    });
}

SecurityService.prototype.checkSecurityTypeExistenceByName = function(data, cb){
	logger.info("checking the securityTypeExistence (checkSecurityTypeExistenceByName())");
	
	var temp = {
			reqId : data.reqId,
			name : data.name
	}
	securityTypeDao.getSecurityTypeByName(temp, function (err, result) {
        if (err) {
            logger.error(" checking checkSecurityTypeExistenceByName (checkSecurityTypeExistenceByName())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info(" checking checkSecurityTypeExistenceByName (checkSecurityTypeExistenceByName())");
        if(result.length > 0){
        	return cb(null, responseCodes.SUCCESS, result[0]);        	
        }else{
        	return cb(messages.securityTypeIdDoesNotExists, responseCodes.NOT_FOUND, result);
        }
    });
}

SecurityService.prototype.createSecurityType = function(data, cb){
	logger.info("checking the createSecurityType (createSecurityType())");
	
	var securityTypeEntity = SecurityConverter.securityTypeEntityFromSecurityTypeModel(data);
	securityTypeDao.createSecurityType(securityTypeEntity, function (err, result) {
        if (err) {
            logger.error(" creating createSecurityType (createSecurityType())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        securityTypeEntity.id = result.id;
        securityTypeDao.getSecurityTypeById(securityTypeEntity, function (err, result) {
            if (err) {
                logger.error(" getting createSecurityType (createSecurityType())" + err);
                return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if(result.length > 0){
            	return cb(null, responseCodes.CREATED, result[0]);        	
            }else{
            	return cb(messages.securityTypeIdDoesNotExists, responseCodes.UNPROCESSABLE, result);
            }
        });
        
    });
}

module.exports = SecurityService;