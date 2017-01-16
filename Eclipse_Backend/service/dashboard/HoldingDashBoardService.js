"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');

var localCache = require('service/cache').local;
var responseCode = config.responseCodes;
var messages = config.messages;

var HoldingDashBoardDao = require('dao/dashboard/HoldingDashBoardDao.js');
var holdingDashBoardDao = new HoldingDashBoardDao();
var HoldingDashboardConverter = require("converter/dashboard/HoldingDashboardConverter.js");

var holdingDashboardConverter = new HoldingDashboardConverter();
var HoldingDashBoardService =  function() {}

HoldingDashBoardService.prototype.getSummaryByPortfolioId = function (data, cb) {
    logger.info("Get Holding Dashboard Summary BY Portfoli Id service called (getSummaryByPortfolioId())");

    holdingDashBoardDao.getSummaryByPortfolioId(data, function (err, fetched) {
       if (err) {
            logger.error("Error in Holding Dashboard Summary BY Portfoli Id (getSummaryByPortfolioId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(fetched){
            holdingDashboardConverter.getDashboardResponseModel(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in Holding Dashboard Summary BY Portfoli Id (getSummaryByPortfolioId())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Holding Dashboard Summary BY Portfoli Id service returned successfully (getSummaryByPortfolioId())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.error("Unable to Get Holding Dashboard Summary BY Portfoli Id (getSummaryByPortfolioId())");
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
       
    });
};

HoldingDashBoardService.prototype.getSummaryByAccountId = function (data, cb) {
    logger.info("Get Holding Dashboard Summary BY Account Id  service called (getSummaryByAccountId())");

    holdingDashBoardDao.getSummaryByAccountId(data, function (err, fetched) {
       if (err) {
            logger.error("Error in getting Holding Dashboard Summary BY Account Id (getSummaryByAccountId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(fetched){
            holdingDashboardConverter.getDashboardResponseModel(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in getting Holding Dashboard Summary BY Account Id (getSummaryByAccountId())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Holding Dashboard Summary BY Account Id service returned successfully (getSummaryByAccountId())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.error("Unable to get Holding Dashboard Summary BY Account Id (getSummaryByAccountId())");
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
    });
};
module.exports = HoldingDashBoardService;