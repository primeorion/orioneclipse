"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');
var PortfolioConverter = require("converter/dashboard/PortfolioConverter.js");

var localCache = require('service/cache').local;
var responseCode = config.responseCode;
var messages = config.messages;

var PortfolioDao = require('dao/dashboard/PortfolioDao.js');
var portfolioDao = new PortfolioDao();
var portfolioConverter = new PortfolioConverter();

var PortfolioService = function () { }

PortfolioService.prototype.getSummary = function (data, cb) {
    logger.info("Get Dashboard portfolio summary service called (getSummary())");

    portfolioDao.getSummary(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Dashboard portfolio summary (getSummary())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(fetched){
            portfolioConverter.getResponseModel(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in getting Dashboard Portfolios summary (getSummary())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Dashboard portfolio summary service returned successfully (getSummary())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.error("Unable to get Dashboard Portfolios summary (getSummary())");
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        // logger.info("Dashboard portfolio summary service returned successfully (getSummary())");
        // return cb(null, responseCode.SUCCESS, result);
    });
};

module.exports = PortfolioService;