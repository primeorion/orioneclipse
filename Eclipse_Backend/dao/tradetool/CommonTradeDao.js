"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var CommonTradeDao = function () { }

//validate Imported Data [Internally called]
CommonTradeDao.prototype.validateImportedData = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];
    var query = ' SELECT id, name ';
    if (data.validData.portfolios) {
        var portfolioId = data.validData.portfolios
        query = query + ' FROM `portfolio` WHERE id IN ( ';
        query = query + portfolioId + ' ) AND isDeleted  = 0 ';
        if (data.isSleeve === true) {
            query = query + '  AND isSleevePortfolio  = 1 ';
        }
    }
    if (data.validData.accounts) {
        query = query + ' , accountId, accountNumber FROM `account` WHERE  ';
        if (data.validData.accountId) {
            var accountId = data.validData.accounts
            query = query + '  accountId IN ( ' + accountId + ') ';
        }
        if (data.validData.accountNumber) {
            var accountNumber = data.validData.accounts
            query = query + '  accountNumber IN ( ' + accountNumber + ') ';
        }
        if (data.isSleeve === true) {
            query = query + '  AND NOT sleeveType = "None" ';
        }
    }
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

//Get Allow Wash Sales
CommonTradeDao.prototype.getAllowWashSales = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT id AS `id`, optionname AS `name` FROM `preferenceOption` WHERE preferenceId = 14 AND isDeleted = 0  ORDER BY  `optionname` ASC ';
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

//Get Allow Short Term Gains
CommonTradeDao.prototype.getAllowShortTermGains = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT id AS `id`, optionname AS `name` FROM `preferenceOption` WHERE preferenceId = 13 AND isDeleted = 0  ';
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

//Get Model Type For Trades
CommonTradeDao.prototype.getModelTypeForTrades = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = ' SELECT DISTINCT  relatedType FROM `modelElements` ';
    query = query + ' WHERE  isDeleted = 0 AND id IN ( SELECT modelElementId FROM `modelDetails` ';
    query = query + ' WHERE  isDeleted = 0 AND modelId IN (  ';

    if (data.modelIds) {
        query = query + data.modelIds;
    }
    if (!data.modelIds) {
        query = query + " ( SELECT modelId FROM `portfolio` WHERE  isDeleted = 0 AND id IN ( ";

        if (data.portfolioIds) {
            query = query + data.portfolioIds + ' ';
        } else {
            if (data.accountIds) {
                query = query + "  (SELECT portfolioId FROM `account` WHERE isDeleted = 0 AND id IN ( " + data.accountIds + ' ) )';
            }
        }
        query = query + ' ) )  ';
    }
    query = query + " )   ) AND relatedType IN ('CATEGORY','CLASS','SUBCLASS') ORDER BY relatedType ASC ; ";

    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

//Get Security Preference Setting Value by SecurityId
CommonTradeDao.prototype.getSecurityPreferenceSettingValue = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = ' SELECT securityId, securitySettingPreferenceId, `value` '; 
    query = query + ' FROM `securitySettingPreferenceValue` ';
    query = query + ' WHERE securityId = ? AND securitySettingPreferenceId IN (11,12) GROUP BY securitySettingPreferenceId ';
    
    logger.debug("Query of getting Security Preference Setting value : " + query);
    connection.query(query, data.security.securityId, function (err, response) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, response);
    });
};

module.exports = CommonTradeDao;