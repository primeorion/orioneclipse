"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');

var localCache = require('service/cache').local;
var responseCode = config.responseCodes;
var messages = config.messages;

var AccountDashBoardDao = require('dao/dashboard/AccountDashBoardDao.js');
var accountDashBoardDao = new AccountDashBoardDao();
var AccountDashBoardConverter = require("converter/dashboard/AccountDashBoardConverter.js");
var accountDashBoardConverter = new AccountDashBoardConverter();

var AccountDashBoardService = function () { }

AccountDashBoardService.prototype.getSummary = function (data, cb) {
    logger.info("Get Account Dashboard Summary  service called (getSummary())");

    accountDashBoardDao.getSummary(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Account Dashboard Summary (getSummary())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            accountDashBoardConverter.accountDashBoardResponse(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in getting Account Dashboard Summary (getSummary())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Account Dashboard Summary service returned successfully (getSummary())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.error("Unable to Account Dashboard Summary (getSummary())");
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
    });
};

module.exports = AccountDashBoardService;