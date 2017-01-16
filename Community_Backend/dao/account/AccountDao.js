"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var localCache = require('service/cache').local;
var AccountDao = function () { }
var tableNames = [
    'account',
    'user',
    'accountType',
    'userTeam'
];

AccountDao.prototype.getSimpleAccountList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Account object", JSON.stringify(data.id));
    var query = [];
    var arr = [];
    var limitedAccess = data.portfolioLimitedAccess;;
    var allAccess = data.portfolioAllAccess;
    // console.log('allAccess')
    // console.log(allAccess)
    // console.log(limitedAccess)
    if (allAccess.length > 0) {
        query.push('SELECT ACC.id,ACC.name, ACC.accountNumber,ACC.isDeleted, ');
        query.push(' ACC.createdDate ,ACC.editedDate,');
        query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy,AT.name as accountTypeId');
        query.push(' from ' + tableNames[0] + '  as ACC ');
        query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = ACC.createdBy ');
        query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = ACC.editedBy ');
        query.push(' left outer join ' + tableNames[2] + ' as AT  on AT.id = ACC.accountTypeId ');
        query.push(' WHERE USER.id = ' + utilService.getAuditUserId(data.user));
        query.push(' AND ACC.isDeleted=0 ');
        query.push(' AND USER.isDeleted=0 ');
        query.push(' AND AT.isDeleted=0 ');

    }
    else {
        arr = limitedAccess;
        query.push('SELECT ACC.id,ACC.name, ACC.accountNumber,ACC.isDeleted, ');
        query.push(' ACC.createdDate ,ACC.editedDate,');
        query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy,AT.name as accountTypeId');
        query.push(' FROM ' + tableNames[3] + ' AS ut ');
        query.push(' INNER JOIN teamPortfolioAccess  AS tpa ON ut.teamId = tpa.teamId AND tpa.teamId IN (' + arr + ')');
        query.push(' INNER JOIN portfolio ON portfolio.id = tpa.portfolioId ');
        query.push(' INNER JOIN account AS ACC ON portfolio.id = ACC.portfolioId');
        query.push(' INNER JOIN team AS team ON team.id = tpa.teamId');
        query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = ACC.createdBy ');
        query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = ACC.editedBy ');
        query.push(' left outer join ' + tableNames[2] + ' as AT  on AT.id = ACC.accountTypeId ');
        query.push(' WHERE ut.userId = ' + utilService.getAuditUserId(data.user));
        query.push(' AND ACC.isDeleted = 0');
        query.push(' AND portfolio.isDeleted = 0');
        query.push(' AND portfolio.isDisabled = 0');
        query.push(' AND tpa.isDeleted = 0');
        query.push(' AND team.isDeleted = 0');
        query.push(' AND USER.isDeleted = 0');
        query.push(' AND AT.isDeleted = 0');
        query.push(' GROUP BY ACC.id')
    }

    if (data.search) {
        query.push(' AND ');
        query.push(' ( ACC.accountNumber= "' + data.search + '" OR  ACC.id= "' + data.search + '" OR ');
        query.push('   ACC.name LIKE "%' + data.search + '%" ');
        query.push(' ) ');
    }
    query = query.join("");
    logger.debug("Get account List Query" + query);;
    connection.query(query, [arr], function (err, data) {
        if (err) {
            return cb(err);
        }
        var accounts = [];
        data.forEach(function (account) {
            accounts.push(account);
        });
        return cb(null, accounts);
    });
};

AccountDao.prototype.getSimpleAccountDetail = function (data, cb) {

    var connection = baseDao.getConnection(data);
    logger.debug("account object", JSON.stringify(data.id));

    var query = [];
    query.push('SELECT ACC.id,ACC.name, ACC.accountNumber,ACC.isDeleted, ');
    query.push(' ACC.createdDate ,ACC.editedDate,ACC.accountTypeId,');
    query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    query.push(' from ' + tableNames[0] + '  as ACC ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = ACC.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = ACC.editedBy ');
    query.push(' WHERE ACC.id=? ');
    query.push(' AND USER.id = ' + utilService.getAuditUserId(data.user));
    query.push(' AND ACC.isDeleted=0 ');
    query = query.join("");
    logger.debug("Get account Detail Query" + query);;
    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        var accounts = [];
        if (result.length > 0) {
            result.forEach(function (account) {
                accounts.push(account);
            });
        }
        return cb(null, accounts);
    });
};

AccountDao.prototype.getAccountList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Account object", JSON.stringify(data.id));
    var query = [];

    query.push('SELECT ACC.id,ACC.name, ACC.accountNumber,ACC.isDeleted, ');
    query.push(' ACC.createdDate ,ACC.editedDate,');
    query.push(' ACC.portfolioId ,ACC.custodianId,');
    query.push(' ACC.ssn ,ACC.modelId,');
    query.push(' ACC.sleeveType,ACC.sma,ACC.accountId,');
    query.push(' ACC.sleeveType,ACC.sma,ACC.accountId,');
    query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy,AT.name as accountTypeId');
    query.push(' from ' + tableNames[0] + '  as ACC ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = ACC.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = ACC.editedBy ');
    query.push(' left outer join ' + tableNames[2] + ' as AT  on AT.id = ACC.accountTypeId ');
    query.push(' WHERE 1=1 ');
    query.push(' AND ACC.isDeleted=0 ');

    if (data.search) {
        query.push(' AND ');
        query.push(' ( ACC.accountNumber= "' + data.search + '" OR');
        query.push('   ACC.name LIKE "%' + data.search + '%" ');
        query.push(' ) ');
    }
    query = query.join("");
    logger.debug("Get account List Query" + query);;
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var accounts = [];

        data.forEach(function (account) {
            accounts.push(account);

        });
        return cb(null, accounts);
    });
};


AccountDao.prototype.getAccountList1 = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Account object", JSON.stringify(data.id));
    var accountList = [];
    var accounts1 =
        {
            id: 1,
            accountId: 1236,
            name: "Test Account",
            accountNumber: "67575",
            accountType: "Saving",
            portfolio: "portfolio-Name",
            custodian: "custodian-Name",
            value: 123654,
            managedValue: 1254,
            excludedValue: 123,
            pendingValue: 1236,
            ssn: "xxx-xx-1234",
            style: "style-value",
            model: "Model-Name",
            sleeveType: "none",
            distributionAmount: 123,
            contributionAmount: 123,
            mergeIn: 123,
            mergeOut: 1236,
            cashNeedAmount: 1000,
            cashTargetPercent: 25,
            targetCashReserve: 200,
            systematicAmount: 100,
            systematicDate: "2016-07-29",
            sma: "Yes",
            status: "Ok",
            pendingTrades: "Yes",
            createdDate: "0000-00-00 00:00:00",
            createdBy: "ETL ETL",
            editedDate: "0000-00-00 00:00:00",
            editedBy: "ETL ETL",
        }



    var accounts2 =
        {
            id: 2,
            accountId: 12367,
            name: "Test Account2",
            accountNumber: "675752",
            accountType: "Saving",
            portfolio: "portfolio-Name",
            custodian: "custodian-Name",
            value: 123654,
            managedValue: 1254,
            excludedValue: 123,
            pendingValue: 1236,
            ssn: "xxx-xx-1234",
            style: "style-value",
            model: "Model-Name",
            sleeveType: "none",
            distributionAmount: 123,
            contributionAmount: 123,
            mergeIn: 123,
            mergeOut: 1236,
            cashNeedAmount: 1000,
            cashTargetPercent: 25,
            targetCashReserve: 200,
            systematicAmount: 100,
            systematicDate: "2016-07-29",
            sma: "Yes",
            status: "Ok",
            pendingTrades: "Yes",
            createdDate: "0000-00-00 00:00:00",
            createdBy: "ETL ETL",
            editedDate: "0000-00-00 00:00:00",
            editedBy: "ETL ETL",
        }
    accountList.push(accounts1);
    accountList.push(accounts2);

    return cb(null, accountList);

};

//Get Account Filters 
AccountDao.prototype.getAccountFilters = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = 'SELECT id,name FROM accountFilterType';
    logger.debug("Query: " + query);

    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        var accountFilterList = [];
        data.forEach(function (accountFilter) {
            accountFilterList.push(accountFilter);
        });
        return cb(null, accountFilterList);

    });
};

AccountDao.prototype.getAccountDetail = function (data, cb) {

    var connection = baseDao.getConnection(data);
    logger.debug("account object", JSON.stringify(data.id));

    var query = [];
    query.push('SELECT ACC.id,ACC.name, ACC.accountNumber,ACC.isDeleted, ');
    query.push(' ACC.createdDate ,ACC.editedDate,ACC.accountTypeId,');
    query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    query.push(' from ' + tableNames[0] + '  as ACC ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = ACC.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = ACC.editedBy ');
    query.push(' WHERE ACC.id=? ');
    query.push(' AND ACC.isDeleted=0 ');
    query = query.join("");
    logger.debug("Get account Detail Query" + query);;
    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        var accounts = [];
        if (result.length > 0) {
            result.forEach(function (account) {
                accounts.push(account);
            });
        }
        return cb(null, accounts);
    });
};

AccountDao.prototype.getAccountDetail1 = function (data, cb) {

    var connection = baseDao.getConnection(data);
    logger.debug("account object", JSON.stringify(data.id));
    var id = data.id;
    var normalList = [];
    var ytdGl = {
        totalGainLoss: 5000,
        shortTermGL: 500,
        longTermGL: 8800,
        shortTermGLStatus:"High",
        longTermGLStatus:"Low",
        totalGainLossStatus:"High"
    };
    var holdings1 = {
        name: "Test Holding 1",
        marketValue: 1000,
        units: 750,
        price: 51,
        percentage: 75
    };
    var holdings2 = {
        name: "Test Holding 2",
        marketValue: 800,
        units: 70,
        price: 750,
        percentage: 70
    };
    var holdingList = [];
    holdingList.push(holdings1);
    holdingList.push(holdings2);

    var accountValue = {
        totalValueOn: "2016-07-07",
        totalValue: 5010,
        status: "High",
        holdings: holdingList
    };
    var issues = {
        systematic: "Yes",
        mergeIn: 3256,
        mergeOut: 1254,
        newAccount: "Yes",
        hasPortfolios: "No",
        custodialRestrictions: "No",
        sma: "Yes",
        importError: 322,
        hasPendingTrades: "Yes"
    };
    var normal = {
        id: 1,
        name: "Test Account",
        accountNumber: "67575",
        billingAccount: "Yes",
        portfolio: "Portfolio Name",
        sleeveType: "None",
        advisor: "Advisor Name",
        custodian: "Custodian Name",
        ssn: "xxx-xx-1234",
        ytdGl: ytdGl,
        issues: issues,
        accountValue: accountValue,
        createdDate: "0000-00-00 00:00:00",
        createdBy: "ETL ETL",
        editedDate: "0000-00-00 00:00:00",
        editedBy: "ETL ETL",
    };
    normalList.push(normal)
    return cb(null, normalList);
};


module.exports = AccountDao;   
