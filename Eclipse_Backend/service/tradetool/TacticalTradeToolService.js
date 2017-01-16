"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var moment = require('moment');
var config = require('config');
var util = require('util');
var messages = config.messages;
var responseCode = config.responseCode;
var localCache = require('service/cache').local;
var TacticalTradeToolDao = require('dao/tradetool/TacticalTradeToolDao.js');
var tacticalTradeToolDao = new TacticalTradeToolDao();
var TacticalTradeToolConverter = require("converter/tradetool/TacticalTradeToolConverter.js");
var tacticalTradeToolConverter = new TacticalTradeToolConverter();
var TacticalTradeToolService = function () { };

TacticalTradeToolService.prototype.getSecurityListByPortAndSecurityId = function (data, cb) {
    logger.info("Get Security list service called (getTaxlotListByPortAndSecurityId())");
    tacticalTradeToolDao.getSecurityListByPortAndSecurityId(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Security list (getTaxlotListByPortAndSecurityId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing  Security for UI (getTaxlotListByPortAndSecurityId())");
       tacticalTradeToolConverter.getSecurityListResponse(fetched, function (err, result) {
            logger.info("Security list returned successfully (getTaxlotListByPortAndSecurityId())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};


TacticalTradeToolService.prototype.getAccountListByPortAndSecurityId = function (data, cb) {
    logger.info("Get account list service called (getAccountListByPortAndSecurityId())");
    tacticalTradeToolDao.getAccountListByPortAndSecurityId(data, function (err, fetched) {
        if (err) {
            logger.error("Getting account list (getAccountListByPortAndSecurityId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing account list for UI (getAccountListByPortAndSecurityId())");
        tacticalTradeToolConverter.getAccountListBySecurityIdResponse(fetched, function (err, result) {
            logger.info("account list returned successfully (getAccountListByPortAndSecurityId())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};
TacticalTradeToolService.prototype.getTaxlotListByPortAndSecurityId = function (data, cb) {
    logger.info("Get Taxlot list service called (getTaxlotListByPortAndSecurityId())");
    tacticalTradeToolDao.getTaxlotListByPortAndSecurityId(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Taxlot list (getTaxlotListByPortAndSecurityId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing  Taxlot for UI (getTaxlotListByPortAndSecurityId())");
        tacticalTradeToolConverter.getTaxlotListResponse(fetched, function (err, result) {
            logger.info("Taxlot list returned successfully (getTaxlotListByPortAndSecurityId())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

TacticalTradeToolService.prototype.getLevelDataList = function (data, cb) {
    logger.info("Get getLevelDataList list service called (getTaxlotListByPortAndSecurityId())");
    tacticalTradeToolDao.getLevelDataList(data, function (err, fetched) {
        if (err) {
            logger.error("Getting getLevelDataList list (getTaxlotListByPortAndSecurityId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing  Taxlot for UI (getTaxlotListByPortAndSecurityId())");
        tacticalTradeToolConverter.getLevelDataListResponse(fetched, function (err, result) {
            logger.info("getLevelDataList list returned successfully (getTaxlotListByPortAndSecurityId())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};


TacticalTradeToolService.prototype.getUnAssignSecurityListByPortId = function (data, cb) {
    logger.info("Get getUnAssignSecurityListByPortId list service called (getTaxlotListByPortAndSecurityId())");
    tacticalTradeToolDao.getUnAssignSecurityListByPortId(data, function (err, fetched) {
        if (err) {
            logger.error("Getting getUnAssignSecurityListByPortId list (getTaxlotListByPortAndSecurityId())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing  getUnAssignSecurityListByPortId for UI (getTaxlotListByPortAndSecurityId())");
        tacticalTradeToolConverter.getUnAssignSecurityListByPortIdResponse(fetched, function (err, result) {
            logger.info("getUnAssignSecurityListByPortId list returned successfully (getTaxlotListByPortAndSecurityId())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};



module.exports = TacticalTradeToolService;