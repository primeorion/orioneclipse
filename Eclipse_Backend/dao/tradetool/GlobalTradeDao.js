"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var GlobalTradeDao = function () { }

//Get security count
GlobalTradeDao.prototype.validateSellSecurity = function (data, securities, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];

    var query = ' SELECT securityId FROM `position` WHERE accountId IN ( ';
    if (data.accountIds) {
        query = query + data.accountIds + ' ';
    } else {
        query = query + ' SELECT id FROM `account` WHERE portfolioId IN ( ';
        if (data.portfolioIds) {
            query = query + data.portfolioIds + ' ';
        } else {
            query = query + ' SELECT id FROM `portfolio` WHERE modelId IN ( ';
            query = query + data.modelIds + ' ) AND isDeleted = 0';
        }
        query = query + ' ) AND isDeleted = 0 ';
    }
    query = query + ' ) AND securityId IN( ' + securities + ') AND isDeleted = 0 ;';
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (data) {
            data.forEach(function (security) {
                result.push(security.securityId);
            }, this);
        }
        return cb(null, result);
    });
};

GlobalTradeDao.prototype.validateBuySecurity = function (data, securities, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];

    var query = ' SELECT id FROM `security` WHERE id IN ( ';

    query = query + securities + ') AND isDeleted = 0 ;';
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (data) {
            data.forEach(function (security) {
                result.push(security.id);
            }, this);
        }
        return cb(null, result);
    });
};

// Validate Account 
GlobalTradeDao.prototype.validateAccount = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        accountIds: data.accountIds,
    };
    var query = 'SELECT id FROM account WHERE isDeleted = 0 AND isDisabled = 0  ';
    var query = query + ' AND id IN ( ' + queryData.accountIds + ' ) ;';
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        if (data) {
            data.forEach(function (account) {
                result.push(account.id);
            }, this);
        }
        return cb(null, result);
    });
};

// Validate Portfolio 
GlobalTradeDao.prototype.validatePortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        portfolioIds: data.portfolioIds,
    };
    var query = 'SELECT id FROM portfolio WHERE isDeleted = 0  ';
    var query = query + ' AND id IN ( ' + queryData.portfolioIds + ' ) ;';
    logger.debug("Query: " + query);

    connection.query(query, function (err, portfolioList) {
        if (err) {
            return cb(err);
        }
        portfolioList.forEach(function (portfolio) {
            result.push(portfolio.id);
        }, this);

        return cb(null, result);
    });
};

// Validate Model 
GlobalTradeDao.prototype.validateModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        modelIds: data.modelIds,
    };
    var query = 'SELECT id FROM model WHERE isDeleted = 0  ';
    var query = query + ' AND id IN ( ' + queryData.modelIds + ' ) ;';
    logger.debug("Query: " + query);

    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        if (data) {
            data.forEach(function (model) {
                result.push(model.id);
            }, this);
        }
        return cb(null, result);
    });
};

// Get security detail list for accounts  [Internally called]
GlobalTradeDao.prototype.getSecurityDetailListForAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        accountIds: data.accountIds,
        sellSecurityIds: data.sellSecurityIds,
    };

    // var query = 'SELECT accountId, securityId as sellSecurityId, price, quantity FROM `position` WHERE isDeleted = 0 AND ';
    // var query = query + ' accountId IN ( ' + queryData.accountIds + ' ) ';
    // var query = query + ' AND securityId IN  ( ' + queryData.sellSecurityIds + ' ) ;';

    var query = ' SELECT po.id AS positionId, po.accountId AS accountId, po.securityId AS sellSecurityId, po.price AS price, po.quantity AS quantity , ';
    query = query + ' acc.custodianId AS custodianId, acc.portfolioId AS portfolioId, acc.sma AS sma,  acc.advisorId AS advisorId, acc.smaTradeable AS smaTradeable,se.securityTypeId As sellSecurityTypeId ';
    var query = query + ' FROM `position` AS po';
    var query = query + ' LEFT JOIN account AS acc ON acc.id = po.accountId ';
    var query = query + ' LEFT JOIN security AS se ON se.id = po.securityId ';
    var query = query + '  WHERE po.isDeleted = 0 AND po.accountId IN ( ' + queryData.accountIds + ' ) AND acc.isDisabled = 0 ';
    var query = query + ' AND po.securityId IN  ( ' + queryData.sellSecurityIds + ' ) ;';
    logger.debug("Query: " + query);

    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        if (data) {
            data.forEach(function (security) {
                var securityData = {};
                securityData["accountId"] = security.accountId;
                securityData["sellSecurityId"] = security.sellSecurityId;
                securityData["price"] = security.price;
                securityData["quantity"] = security.quantity;
                securityData["custodianId"] = security.custodianId;
                securityData["portfolioId"] = security.portfolioId;
                securityData["positionId"] = security.positionId;
                securityData["sma"] = security.sma;
                securityData["advisorId"] = security.advisorId;
                securityData["smaTradeable"] = security.smaTradeable;
                securityData["sellSecurityTypeId"] = security.sellSecurityTypeId;

                result.push(securityData);
            }, this)
        }
        return cb(null, result);
    });
};

// Apply Preferences For Trade  [Internally called]
GlobalTradeDao.prototype.applyPreferencesForTrade = function (data, accountId, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        accountId: accountId
    };

    // console.log("_____________________________________________________________________________________________________" + util.inspect( data.connection));
    // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"+util.inspect(connection._clusterId));
    connection.query(" CALL getPreferencesValuesForRebalancer (?, ?) ", [queryData.accountId, "ACCOUNT"], function (err, response) {
        //data.connection.query(" CALL getPreferencesValuesForRebalancer (?, ?) ", [queryData.accountId, "ACCOUNT"], function (err, response) {
        if (err) {
            return cb(err);
        }
        if (response) {
            var preferencesData = {};
            preferencesData.accountSetting = response[0];
            preferencesData.tradeSetting = response[2];
            result.push(preferencesData);
        }
        return cb(null, result);
    });
};

// Get Buy security Price  [Internally called]
GlobalTradeDao.prototype.getBuySecurityPrice = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var securityIds = data.buyTradeValid;
    var query = ' SELECT 	`securityId` as `buySecurityId`,  `price` as `buyPrice` FROM securityPrice WHERE  isDeleted = 0  AND securityId IN ( ';
    securityIds.forEach(function (securityId) {
        query = query + securityId.buySecurityId + ',';
    }, this);
    query = query.substr(0, query.length - 1);
    query = query + ' ) ';

    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        if (data) {
            data.forEach(function (security) {
                var securityData = {};
                securityData["buySecurityId"] = security.buySecurityId;
                securityData["buyPrice"] = security.buyPrice;
                result.push(securityData);
            }, this)
        }
        return cb(null, result);
    });
}

//Get Accounts For Trades  [Internally called]
GlobalTradeDao.prototype.getAccountsForTrades = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];

    var query = ' SELECT id FROM `account` WHERE isDeleted = 0 AND portfolioId IN ( ';
    if (data.portfolioIds) {
        query = query + data.portfolioIds + ' ';
    } else {
        query = query + ' SELECT id FROM `portfolio` WHERE isDeleted = 0 AND modelId IN ( ';
        query = query + data.modelIds + ' ) ';
    }
    query = query + ' ) ';

    logger.debug("Query: " + query);
    connection.query(query, function (err, accounts) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        accounts.forEach(function (account) {
            result.push(account.id);
        })
        return cb(null, result);
    });
};

//Get Accounts For Trades  [Internally called]
GlobalTradeDao.prototype.getAccountList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    //var result = [];
    // SELECT account.id, p.id, p.modelId FROM accounts 
    // LEFT JOIN portfolio AS p ON p.id = account.portfolioId AND p.isDeleted = 0
    // WHERE account.isDeleted = 0

    // AND p.id IN ()

    // AND p.modelId IN ()

    // var query = ' SELECT id as accountId, portfolioId FROM `account` WHERE isDeleted = 0 AND portfolioId IN ( ';
    // if (data.portfolioIds) {
    //     query = query + data.portfolioIds + ' ';
    // } else {
    //     query = query + ' SELECT id FROM `portfolio` WHERE isDeleted = 0 AND modelId IN ( ';
    //     query = query + data.modelIds + ' ) ';
    // }
    // query = query + ' ) ';
    var query = ' SELECT account.id AS accountId, p.id AS portfolioId, p.modelId AS modelId FROM account ';
    query += ' LEFT JOIN portfolio AS p ON p.id = account.portfolioId AND p.isDeleted = 0 AND  p.isDisabled = 0 ';
    query += ' WHERE account.isDeleted = 0 AND account.isDisabled = 0 ';
    if (data.portfolioIds) {
        var portfolioIds = data.portfolioIds.join(',');
        query += ' AND p.id IN (' + portfolioIds + ') ';
    } else {
        var modelIds = data.modelIds.join(',');
        query += ' AND p.modelId IN (' + modelIds + ') ';
    }
    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        var accountList = [];
        var portfolioList = [];
        result.forEach(function (account) {
            accountList.push(account.accountId);
            if (data.portfolioIds) {
                portfolioList.push(account.portfolioId);
            } else {
                portfolioList.push(account.modelId);
            }
            //result.push(accountData);
        }, this)
        return cb(null, accountList, portfolioList);
    });
};

// //Get security ids
// GlobalTradeDao.prototype.getSecurityList = function (data, cb) {
//     var connection = baseDao.getConnection(data);
//     var securityIds = data.securityIds;
//     var query;
//     query = ' SELECT security.id AS "id", security.orionConnectExternalId AS "orionConnectExternalId", ';
//     query = query + ' security.name AS "name", security.symbol AS "symbol", security.securityTypeId AS "securityTypeId", ';
//     query = query + ' securityType.name AS "securityType", securityPrice.price AS "price", security.statusId AS "statusId", ';
//     query = query + ' securityStatus.status AS "status", security.isDeleted AS "isDeleted", security.assetCategoryId AS "assetCategoryId", ';
//     query = query + ' assetCategory.name AS "assetCategory", security.assetClassId AS "assetClassId", ';
//     query = query + ' assetClass.name AS "assetClass", security.assetSubClassId AS "assetSubClassId", assetSubClass.name AS "assetSubClass", ';
//     query = query + ' security.isCustodialCash AS "custodialCash", security.createdDate AS "createdOn", ';
//     query = query + ' security.editedDate AS "editedOn", usCreated.userLoginId AS "createdBy", usEdited.userLoginId AS "editedBy" ';
//     query = query + ' FROM `security` ';
//     query = query + ' INNER JOIN `user` `usCreated` ON (security.createdBy = usCreated.id)  ';
//     query = query + ' INNER JOIN `user` `usEdited` ON (security.editedBy = usEdited.id) ';
//     query = query + ' INNER JOIN securityStatus ON (security.statusId = securityStatus.id) ';
//     query = query + ' LEFT JOIN assetCategory ON (security.assetCategoryId = assetCategory.id) ';
//     query = query + ' LEFT JOIN assetClass ON (security.assetClassId = assetClass.id) ';
//     query = query + ' LEFT JOIN assetSubClass ON (security.assetSubClassId = assetSubClass.id) ';
//     query = query + ' LEFT JOIN securityType ON (security.securityTypeId = securityType.id) ';
//     query = query + ' LEFT JOIN securityPrice ON (security.id = securityPrice.securityId) ';
//     query = query + ' INNER JOIN ';
//     query = query + ' ( ';
//     query = query + ' SELECT MAX(securityPrice.priceDateTime) AS "time", securityPrice.securityId AS "securityId" ';
//     query = query + ' FROM securityPrice ';
//     query = query + ' GROUP BY securityPrice.securityId ';
//     query = query + ' ) `maxt` ON  ';
//     query = query + ' ( ';
//     query = query + ' securityPrice.securityId = maxt.securityId AND  ';
//     query = query + ' securityPrice.priceDateTime = maxt.time OR securityPrice.securityId IS NULL  OR securityPrice.priceDateTime IS NULL ';
//     query = query + ' )  ';
//     query = query + '  WHERE (security.isDeleted = 0) AND  ';
//     query = query + ' ( ';
//   //  query = query + ' security.name LIKE \'%i%\' OR security.symbol LIKE \'%i%\' ';
//   if (data.search) {
//      //   query.push(' AND ');
//      //   if (data.search.match(/^[0-9]+$/g)) {
//            // query.push(' (security.name = "' + data.search + '" OR ');
//        // query.push(' security.name LIKE "%' + data.search + '%" ');
//       data.search = data.search.replace(/\"/g, "'");
//          query = query +' security.name LIKE "%' + data.search + '%" OR ';

//       //  }
//          query = query + ' security.symbol LIKE "%' + data.search + '%" ';
//         if (data.search.match(/^[0-9]+$/g)) {
//           //  query.push(' ) ');
//         }
//       //  query = query + ' ORDER BY security.name, security.id DESC ';
//     }
//     // query = query + ' ) AND security.id IN (14637,14614) ';
//     query = query + ' ) AND security.id IN ( ';
//     securityIds.forEach(function (securityId) {
//         query = query + securityId + ',';
//         //     result.push(securityId);
//     })
//     query = query.substr(0, query.length - 1);
//     query = query + ' ) ';
//     query = query + ' GROUP BY security.id ORDER BY security.name ASC '

//     logger.debug("Query: " + query);
//     connection.query(query, function (err, result) {
//         if (err) {
//             logger.error(err);
//             return cb(err);
//         }
//         return cb(null, result);
//     });
// };

module.exports = GlobalTradeDao;