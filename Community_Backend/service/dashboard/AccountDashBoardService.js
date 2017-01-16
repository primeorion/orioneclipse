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

var AccountDashBoardService =  function() {}

AccountDashBoardService.prototype.getSummary = function (data, cb) {
    logger.info("Get Dashboard account summary service called (getSummary())");

    accountDashBoardDao.getSummary(data, function (err, result) {
        if (err) {
            logger.error("Error in getting Dashboard account summary (getSummary())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Dashboard account summary service returned successfully (getSummary())");
        return cb(null, responseCode.SUCCESS, result);
    });
};

module.exports = AccountDashBoardService;