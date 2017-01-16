
var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var responseCodes = config.responseCodes;
var request = require('request');
var rebalanceUrl = config.env.prop.rebalanceUrl;
var util = require('util');
var TradeInstanceDao = require('dao/tradeorder/TradeInstanceDao.js');
var multer = require('multer');
var util = require('util');
var ModelParser = require('xlsx');
var fs = require('fs');
var _ = require('underscore');

var tradeInstanceDao = new TradeInstanceDao();
//var commonService = CommonService();

var TradeInstanceService = function () { };

TradeInstanceService.prototype.generateTradeInstance = function (data, cb) {
	var self = this;
    logger.info("Trade Instance Service Called (generateTradeInstance())");
    data.tradesInstance = {};
    // TODO - create converter to get tradeInstance object from data
    // data.tradesInstance.tradingAppId = 7;// CashNeeds App id from tradeApplication
    data.tradesInstance.tradingAppId = data.appId;
    data.tradesInstance.notes = "";
    data.tradesInstance.description = 	data.tradeInstance.description;
    // above code will be replaced by converter
    tradeInstanceDao.saveTradeInstance(data, function (err, tradeInstanceValue) {
        if (err) {
            logger.error("Error in saving  trade instance (generateTradeInstance()) " + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (tradeInstanceValue != null && tradeInstanceValue.affectedRows > 0) {
            data.tradeInstanceId = tradeInstanceValue.insertId;
            logger.info("Instance id ("+data.tradeInstanceId+") generated for App id : "+ data.tradesInstance.tradingAppId)
            return cb(err, responseCode.SUCCESS, {
            	tradeInstanceId : data.tradeInstanceId
            });
        } else {
            logger.error("Unable to saving  trade instance (generateTradeInstance()) " + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
    });
};

TradeInstanceService.prototype.deleteTradeInstance = function (data, cb) {
	var self = this;
    logger.info("Trade Instance Service Called (deleteTradeInstance())");
    // above code will be replaced by converter
    tradeInstanceDao.deleteTradeInstance(data, function (err, response) {
        if (err) {
            logger.error("Error in delteting  trade instance (deleteTradeInstance()) " + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
            logger.info("Instance id ("+data.tradesInstance.instanceId+") successfully deleted.")
            return cb(err, responseCode.SUCCESS);
    });
};

module.exports = TradeInstanceService;

