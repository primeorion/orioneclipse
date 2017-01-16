"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var TradeToTargetDao = function () { }


//Get Account And Security Info   [Internally called]
TradeToTargetDao.prototype.getAccountAndSecurityInfo = function (data, cb) {
    logger.info(" Get Account And Security Info Dao called (getAccountAndSecurityInfo())");
    var connection = baseDao.getConnection(data);
    var result = []
    var userId = utilService.getAuditUserId(data.user);
    var queryData = {
        accountId: data.accountId,
        securityId: data.security.securityId,
        modelTypeId: data.security.modelTypeId ? data.security.modelTypeId : null

    };
    connection.query(" CALL getAccountAndSecurityForTradeToTarget (?, ?, ?, ?) ", [data.user.userId, queryData.accountId, queryData.securityId, queryData.modelTypeId], function (err, response) {
        //data.connection.query(" CALL getAccountAndSecurityForTradeToTarget (?, ?, ?) ", [userId, queryData.accountId, queryData.securityId], function (err, response) {
        if (err) {
            logger.info("Error in sp call");
            return cb(err);
        }
        else {
            var tradeToTargetData = {};
            tradeToTargetData.securitySetting = response[0];
            tradeToTargetData.accountSetting = response[1];
            tradeToTargetData.holdingSetting = response[2];
            tradeToTargetData.taxLotSetting = response[3];
            tradeToTargetData.buyWashSetting = response[4];
            tradeToTargetData.recentOrExistingBuy = response[5];
            tradeToTargetData.modelElementSetting = response[6];
            tradeToTargetData.buyAccountSetting = response[7];
            tradeToTargetData.securityPriceSetting = response[8];

            result.push(tradeToTargetData);
        }
        logger.info("SP getAccountAndSecurityForTradeToTarget result return successfully");
        return cb(null, result);
    });
};

// Get Portfolios For Model Account Count
TradeToTargetDao.prototype.getAccountsForModels = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountList = [];
    var modelList = [];

    var query = [];
    var modelIds = data.modelIds;
    var newModelIds = modelIds.join(",");
    query.push(' SELECT * FROM ( ');
    query.push(' SELECT p.id, p.name,  "APPROVED" as status ');
    query.push(' , COUNT(account.id) AS "accountCount", account.id AS accountId ,p.modelId AS modelId    ');
    query.push(' FROM portfolio as p ');
    query.push(' LEFT JOIN account ON (account.portfolioId = p.id) ');
    query.push(' where p.modelId IN (' + newModelIds + ') ');
    query.push(' AND p.isDeleted = 0 ');
    query.push(' GROUP BY p.id ');
    query.push(" UNION ")
    query.push(' SELECT tmp.portfolioId as id, p.name as name,  "PENDING" as status');
    query.push(' , COUNT(account.id) AS "accountCount" , account.id AS accountId ,p.modelId AS modelId ');
    query.push(' FROM tempModelPortfolio as tmp INNER JOIN portfolio as p ON p.id = tmp.portfolioId ');
    query.push(' LEFT JOIN account ON (account.portfolioId = p.id)  ');

    query.push(' where (tmp.modelId IN (' + newModelIds + ') ) AND tmp.isDeleted = 0 AND p.isDeleted = 0 ');
    query.push(' GROUP BY p.id ');
    query.push(' ) tempModelQuery WHERE tempModelQuery.accountCount = 1');
    query = query.join("");

    logger.debug("Query: " + query);
    connection.query(query, function (err, accounts) {
        if (err) {
            logger.error(err);
            return cb(err);
        } else {
            accounts.forEach(function (account) {
                accountList.push(account.accountId);
                modelList.push(account.modelId);
            }, this);
            return cb(null, accountList, modelList);
        }
    });
}
module.exports = TradeToTargetDao;

