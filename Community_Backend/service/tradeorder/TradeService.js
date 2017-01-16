"use strict";

var moduleName = __filename;
var TradeDao = require('dao/tradeorder/TradeDao.js');
var tradeDao = new TradeDao();
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCodes;


var TradeService =  function() {}

TradeService.prototype.getTradeExecutionTypeList = function (data, cb) {
	logger.info("Get trade execution type list service called (getTradeExecutionTypeList())");
    tradeDao.getTradeExecutionTypeList(data, function (err, result) {
        if (err) {
            logger.error("Error in getting trade execution type list (getTradeExecutionTypeList())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Trade executionType list returned successfully (getTradeExecutionTypeList())");
        return cb(null, responseCodes.SUCCESS, result);
    });
};
TradeService.prototype.getTradeListByPortfolio = function (data, cb) {
	logger.info("Get trade list by portfolio service called (getTradeListByPortfolio())");
    tradeDao.getTradeListByPortfolio(data, function (err, result) {
        if (err) {
            logger.error("Error in getting trade  list (getTradeListByPortfolio())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCodes.SUCCESS, result);
    });
};

module.exports = TradeService;