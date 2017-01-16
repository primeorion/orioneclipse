"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;

var SecurityDao = require('dao/community/SecurityDao.js');
var securityDao = new SecurityDao();
var SecurityResponse = require("model/community/security/SecurityResponse.js");

var SecurityService = function () { };
//getSecurityByIdOrName
// SecurityService.prototype.getSecurityList = function (inputData, cb) {
//     logger.info("Get security list service called (getsecurityList())");

//     securityDao.getList(inputData, function (err, fetched) {
//         if (err) {
//             logger.error("Getting security list (getsecurityList())" + err);
//             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         logger.info("Preparing security list (getsecurityList())");
//         return cb(null, responseCode.SUCCESS, new SecurityResponse(fetched));
//     });
// };

SecurityService.prototype.getSecurityList = function (inputData, cb) {
    logger.info("Get security list service called (getsecurityList())");
     if(inputData.search == undefined){
        return cb(messages.missingQueryParams, responseCode.BAD_REQUEST);
    }
    if(inputData.search == null || inputData.search == "" || inputData == ''){
        return cb(messages.missingQueryParamsValue, responseCode.BAD_REQUEST);
    }
    if(isNaN(inputData.search) == false){
        return cb(messages.invalidQueryParamValue, responseCode.BAD_REQUEST);
    }
    securityDao.getSecurityByIdOrName(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting security list (getSecurityList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        // if(fetched.length < 1){
        //     logger.info("Getting security list (getSecurityList)");
        //     return cb(messages.securityNotFound, responseCode.NOT_FOUND); 
        // }

        logger.info("Preparing security list (getSecurityList())");
        return cb(null, responseCode.SUCCESS, fetched);
    });
};


SecurityService.prototype.getSecurityDetail = function (inputData, cb) {
    logger.info("Get security details service called (getSecurityDetail())");
    securityDao.getDetail(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting security detail (getSecurityDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing security (getSecurityDetail())" + JSON.stringify(fetched));
            return cb(null, responseCode.SUCCESS, fetched[0]);
        } else {
            logger.info("security Detail not found (getSecurityDetail())" + inputData.id);
            return cb(messages.communitysecurityNotFound, responseCode.NOT_FOUND);
        }
    });
};

module.exports = SecurityService;