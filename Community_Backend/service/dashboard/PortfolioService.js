"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');

var localCache = require('service/cache').local;
var responseCode = config.responseCodes;
var messages = config.messages;

var PortfolioDao = require('dao/dashboard/PortfolioDao.js');
var portfolioDao = new PortfolioDao();

var PortfolioService =  function() {}

PortfolioService.prototype.getSummary = function (data, cb) {
    logger.info("Get Dashboard portfolio summary service called (getSummary())");

    portfolioDao.getSummary(data, function (err, result) {
        if (err) {
            logger.error("Error in getting Dashboard portfolio summary (getSummary())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Dashboard portfolio summary service returned successfully (getSummary())");
        return cb(null, responseCode.SUCCESS, result);
    });
};

module.exports = PortfolioService;