"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var localCache = require('service/cache').local;
var AccountDao = require('dao/account/AccountDao.js');
var accountDao = new AccountDao();
var AccountResponse = require("model/account/AccountResponse.js");
var AccountConverter = require("converter/account/AccountConverter.js");
var accountConverter = new AccountConverter();
var AccountService = function () { };

AccountService.prototype.getSimpleAccountList = function (data, cb) {

    var session = localCache.get(data.reqId).session;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    data.portfolioAllAccess = session.portfolioAllAccess;
    logger.info("Get account list service called (getSimpleAccountList())");
    accountDao.getSimpleAccountList(data, function (err, fetched) {
        if (err) {
            logger.error("Getting account list (getSimpleAccountList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing account list for UI (getSimpleAccountList())");
        accountConverter.getModelToResponse(fetched, function (err, result) {

            logger.info("account list returned successfully (getSimpleAccountList())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

AccountService.prototype.getSimpleAccountDetail = function (data, cb) {
    logger.info("Get Account details service called (getSimpleAccountDetail())");
    accountDao.getSimpleAccountDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Account detail (getSimpleAccountDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        } if (fetched.length > 0) {
            logger.info("Preparing Account list for UI (getSimpleAccountDetail())");
            accountConverter.getModelToResponse(fetched, function (err, result) {
                if (result.length > 1) {
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    return cb(null, responseCode.SUCCESS, result[0]);
                }
            });
        } else {
            logger.info("Account  detail not found (getSimpleAccountDetail())" + data.id);
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};



AccountService.prototype.getAccountList = function (data, cb) {
    logger.info("Get account list service called (getAccountList())");
    accountDao.getAccountList1(data, function (err, fetched) {
        if (err) {
            logger.error("Getting account list (getAccountList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing account list for UI (getAccountList())");
        accountConverter.getAllAccountModelToResponse(fetched, function (err, result) {
            logger.info("account list returned successfully (getAccountList())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

AccountService.prototype.getAccountFilters = function (data, cb) {
    logger.info("Get Portfolio Status service called (getAccountFilters())");
    accountDao.getAccountFilters(data, function (err, result) {
        if (err) {
            logger.error("Error in getting portfolio Status (getTypesStatus())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Portfolio Status service returned successfully (getAccountFilters())");
        return cb(null, responseCode.SUCCESS, result);

    });
};


AccountService.prototype.getAccountDetail = function (data, cb) {
    logger.info("Get Account details service called (getAccountDetail())");
    accountDao.getAccountDetail1(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Account detail (getAccountDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        } if (fetched.length > 0) {
            logger.info("Preparing Account list for UI (getAccountDetail())");
            // accountConverter.getADModelToResponse(fetched, function (err, result) 
            {
                if (fetched.length > 1) {
                    return cb(null, responseCode.SUCCESS, fetched);
                } else {
                    return cb(null, responseCode.SUCCESS, fetched[0]);
                }
            }
            //);
        }
    });
};


module.exports = AccountService;