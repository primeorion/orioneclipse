"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var squel = require("squel");
var dateFormat = require('dateformat');
var squelUtils = require("service/util/SquelUtils.js");
var utilDao = require('dao/util/UtilDao.js');
var localCache = require('service/cache').local;
var enums = require('config/constants/ApplicationEnum.js');
var utilService = new (require('service/util/UtilService'))();
var TacticalTradeToolDao = function () { }
var util = require('util');

TacticalTradeToolDao.prototype.getSecurityListByPortAndSecurityId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get secuirty list with  associated to secuirty set id dao: ");


    connection.query("CALL getSecurityListByPortfolioAndSecuritySetId(?,?,?,?)", [userId, data.portfolioId, data.securitySetId, 0], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        var secuirtyList = [];
        result.forEach(function (security) {
            secuirtyList.push(security);
        });

        return cb(null, secuirtyList);

    });
};


TacticalTradeToolDao.prototype.getAccountListByPortAndSecurityId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get account list with secuirty id dao: ");

    connection.query("CALL getAccountListByPortfolioAndSecurityId(?,?,?,?)", [userId, data.portfolioId, data.securityId, 0], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        var accountList = [];
        result.forEach(function (account) {
            accountList.push(account);
        });
        return cb(null, accountList);

    });
};

TacticalTradeToolDao.prototype.getTaxlotListByPortAndSecurityId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get tax list   dao: ");

    connection.query("CALL getTaxlotListBySecurityIdAndAccountId(?,?,?)", [userId, data.securityId, data.accountId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        var taxlotList = [];
        result.forEach(function (tax) {
            taxlotList.push(tax);
        });
        return cb(null, taxlotList);

    });
};


TacticalTradeToolDao.prototype.getLevelDataList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get Level data list with  associated to portfolio Id dao: ");

    connection.query("CALL getPortfolioLevelData(?,?,?,?,?)", [userId, data.portfolioId, data.usePendingValue, data.defaultAction, data.accountId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
       
        return cb(null, result);

    });
};

TacticalTradeToolDao.prototype.getUnAssignSecurityListByPortId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get UnAssign Security List By PortId data list with  associated to portfolio Id dao: ");

    connection.query("CALL getUnAssignSecurityListByPortAndAccountId(?,?,?)", [userId, data.portfolioId, data.accountId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        return cb(null, result);

    });
};




module.exports = TacticalTradeToolDao;   