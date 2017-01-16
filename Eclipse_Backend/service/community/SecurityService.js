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

SecurityService.prototype.getSecurityList = function (inputData, cb) {
    logger.info("Get security list service called (getsecurityList())");

    securityDao.getList(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting security list (getsecurityList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing security list (getsecurityList())");
        return cb(null, responseCode.SUCCESS, new SecurityResponse(fetched));
    });
};

SecurityService.prototype.getSecurityDetail = function (inputData, cb) {
    logger.info("Get security details service called (getsecurityDetail())");
    securityDao.getDetail(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting security detail (getsecurityDetail())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing security (getsecurityDetail())" + JSON.stringify(fetched));
            return cb(null, responseCode.SUCCESS, new SecurityResponse(fetched[0]));
        } else {
            logger.info("security Detail not found (getsecurityDetail())" + inputData.id);
            return cb(messages.communitysecurityNotFound, responseCode.NOT_FOUND);
        }
    });
};

module.exports = SecurityService;