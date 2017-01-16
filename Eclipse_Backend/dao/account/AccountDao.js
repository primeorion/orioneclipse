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
var accountEntity = require("entity/account/Account.js");
var userEntity = require("entity/user/User.js");
var accountTypeEntity = require("entity/account/AccountType.js");
var portfolioEntity = require("entity/portfolio/Portfolio.js");
var teamPortfolioAccessEntity = require("entity/team/TeamPortfolio.js");
var teamEntity = require("entity/team/Team.js");
var userTeamEntity = require("entity/user/UserTeam.js");
var positionEntity = require("entity/holding/Position.js");
var smaAssetCategory = require('entity/account/SmaAssetCategory.js');
var smaAssetClass = require('entity/account/SmaAssetClass.js');
var smaSecuritySubClass = require('entity/account/SmaSecuritySubClass.js');
var utilService = new (require('service/util/UtilService'))();
var securityPriceEntity = require("entity/security/SecurityPrice.js");
var securityEntity = require("entity/security/Security.js");


var modelEntity = require("entity/model/ModelEntity.js");
var AccountDao = function () { }
var util = require('util');

AccountDao.prototype.getSimpleAccountList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.info("Simple account list dao (getSimpleAccountList()");
    var teamIds = data.user.teamIds;
    var roleTypeId = data.user.roleTypeId;
    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    logger.debug("roleTypeId is " + roleTypeId);
    var query = squel.select()
        .field(accountEntity.columns.id, "id")
        .field(accountEntity.columns.accountNumber, "accountNumber")
        .field(accountEntity.columns.name, "name")
        .field(accountEntity.columns.isDeleted, "isDeleted")
        .field(accountEntity.columns.createdDate, "createdOn")
        .field(accountEntity.columns.editedDate, "editedOn")
        .field(userEntity.usCreated.userLoginId, 'createdBy')
        .field(userEntity.usEdited.userLoginId, 'editedBy')
        .field(accountTypeEntity.columns.name, "accountTypeId")
        .field(accountEntity.columns.accountId, "accountId")
        .field(accountEntity.columns.portfolioId, "portfolioId")
        .field(portfolioEntity.columns.name, "portfolioName")
        .from(accountEntity.tableName)

    if (roleTypeId !== enums.roleType.FIRMADMIN && limitedAccess.length > 0) {
        query.join(portfolioEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(portfolioEntity.columns.id, accountEntity.columns.portfolioId)
            ))

        query.join(teamPortfolioAccessEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(teamPortfolioAccessEntity.columns.portfolioId, portfolioEntity.columns.id)
            ))

        query.join(teamEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(teamEntity.columns.id, teamPortfolioAccessEntity.columns.teamId)
            ))

        query.join(userTeamEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(userTeamEntity.columns.teamId, teamPortfolioAccessEntity.columns.teamId)
            ))

        query.where(
            squel.expr()
                .and(squelUtils.eql(teamPortfolioAccessEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(portfolioEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(teamEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(userTeamEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(teamEntity.columns.status, 1))
                .and(squelUtils.in(teamPortfolioAccessEntity.columns.teamId, teamIds))
        )
    }
    else {
        query.left_join(portfolioEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(portfolioEntity.columns.id, accountEntity.columns.portfolioId)
            )
        )
    }

    query.left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, accountEntity.columns.createdBy)
    )

        .left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, accountEntity.columns.editedBy)
        )

    query.left_join(accountTypeEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(accountTypeEntity.columns.id, accountEntity.columns.accountTypeId)
        )
    )
        .where(
        squel.expr().and(squelUtils.eql(1, 1))
            .and(squelUtils.eql(accountEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(accountEntity.columns.isDisabled, 0))

        );

    if (data.inSleeve === 'true' || (data.inSleeve === 'true' && data.inModel === 'true')) {

        query.join(modelEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(modelEntity.columns.id, accountEntity.columns.modelId)
            )
        )
        if (data.search) {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(accountEntity.columns.id, data.search))
                        .or(squelUtils.like(accountEntity.columns.name, data.search))
                        .or(squelUtils.like(accountEntity.columns.accountNumber, data.search))
                )
            )
      
        }
        query.where(
            squel.expr().and(
                squel.expr()
                    .and(squelUtils.notEql(accountEntity.columns.sleeveType, 'None'))
            )
        )
    }

    else if (data.inModel === 'true') {
        query.join(modelEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(modelEntity.columns.id, portfolioEntity.columns.modelId)
            )
        )
        if (data.search) {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(accountEntity.columns.id, data.search))
                        .or(squelUtils.like(accountEntity.columns.name, data.search))
                        .or(squelUtils.like(accountEntity.columns.accountNumber, data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(accountEntity.columns.id, data.search))
                        .or(squelUtils.like(accountEntity.columns.name, data.search))
                        .or(squelUtils.like(accountEntity.columns.accountNumber, data.search))
                )
            )
        }

    }
    else if (data.search) {
        if (data.search) {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(accountEntity.columns.id, data.search))
                        .or(squelUtils.like(accountEntity.columns.name, data.search))
                        .or(squelUtils.like(accountEntity.columns.accountNumber, data.search))
                )
            )
        }
        else {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(accountEntity.columns.id, data.search))

                )
            )
        }
    }


    query.group(accountEntity.columns.name);
    query.order(accountEntity.columns.name);
    if (data.search) {
        query.limit(20);
    }
    query = query.toString();

    logger.debug("Get simple account list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, data);
    });
};

AccountDao.prototype.getAccountsWithSecurity = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var query = [];
    query.push(' SELECT * FROM `position` WHERE securityId = ? AND isDeleted = 0  ');

    query = query.join("");
    logger.debug("Get accounts with securities Query" + query);

    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

AccountDao.prototype.getAccount = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var query = [];
    query.push(' SELECT * FROM `account` WHERE id = ? AND isDeleted = 0  ');

    query = query.join("");
    logger.debug("Get accounts with securities Query" + query);

    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

AccountDao.prototype.getSimpleAccountDetail = function (data, cb) {

    var connection = baseDao.getConnection(data);
    logger.debug("account  object for get Simple account detail", JSON.stringify(data.id));

    var query = [];
    query.push('SELECT ACC.id,ACC.name, ACC.accountNumber,ACC.isDeleted,ACC.accountId as accountId, ');
    query.push(' ACC.createdDate as createdOn ,ACC.editedDate as editedOn,AT.name as accountTypeId,');
    query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    query.push(' from  account   as ACC ');
    query.push(' left outer join user as USER  on USER.id = ACC.createdBy ');
    query.push(' left outer join user as USERS  on USERS.id = ACC.editedBy ');
    query.push(' left outer join accountType as AT  on AT.id = ACC.accountTypeId ');
    query.push(' WHERE ACC.id=? ');
    query.push(' AND ACC.isDeleted=0 ');
    query = query.join("");
    logger.debug("Get simple account Detail Query" + query);;
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

//Get Account Filters 
AccountDao.prototype.getAccountFilters = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("account filter object ");
    var query = 'SELECT id,name FROM accountFilterType order by name';
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

AccountDao.prototype.getSimpleAccountWithValue = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var teamIds = data.user.teamIds;
    var roleTypeId = data.user.roleTypeId;
    var limitedAccess = data.portfolioLimitedAccess;;

    var allAccess = data.portfolioAllAccess;
    logger.debug("get Simple Account With Value dao ");

    var query = squel.select()
        .field(accountEntity.columns.id, "id")
        .field(accountEntity.columns.accountNumber, "accountNumber")
        .field(accountEntity.columns.name, "name")
        .field(accountEntity.columns.isDeleted, "isDeleted")
        .field(accountEntity.columns.createdDate, "createdOn")
        .field(accountEntity.columns.editedDate, "editedOn")
        .field(userEntity.usCreated.userLoginId, 'createdBy')
        .field(userEntity.usEdited.userLoginId, 'editedBy')
        .field(accountTypeEntity.columns.name, "accountTypeId")
        .field(accountEntity.columns.portfolioId, "portfolioId")
        .field(securityPriceEntity.columns.price, "price")
        .field(portfolioEntity.columns.name, "portfolioName")
        .field("COALESCE(" + "Sum(" + securityPriceEntity.columns.price + " * " + positionEntity.columns.quantity + ")" + ",0)", "value")

        .from(accountEntity.tableName)
    if (roleTypeId !== enums.roleType.FIRMADMIN && limitedAccess.length > 0) {
        query.join(portfolioEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(portfolioEntity.columns.id, accountEntity.columns.portfolioId)
            ))

        query.join(teamPortfolioAccessEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(teamPortfolioAccessEntity.columns.portfolioId, portfolioEntity.columns.id)
            ))

        query.join(teamEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(teamEntity.columns.id, teamPortfolioAccessEntity.columns.teamId)
            ))

        query.join(userTeamEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(userTeamEntity.columns.teamId, teamPortfolioAccessEntity.columns.teamId)
            ))

        query.where(
            squel.expr()
                .and(squelUtils.eql(teamPortfolioAccessEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(portfolioEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(teamEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(userTeamEntity.columns.isDeleted, 0))
                .and(squelUtils.eql(teamEntity.columns.status, 1))
                .and(squelUtils.in(teamPortfolioAccessEntity.columns.teamId, teamIds))
        )
    }
    else {
        query.left_join(portfolioEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(portfolioEntity.columns.id, accountEntity.columns.portfolioId)
            )
        )
    }

    query.left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, accountEntity.columns.createdBy)
    )

    query.left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, accountEntity.columns.editedBy)
    )

    query.left_join(accountTypeEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(accountTypeEntity.columns.id, accountEntity.columns.accountTypeId)
        )
    )

    query.left_join(positionEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(accountEntity.columns.id, positionEntity.columns.accountId)
        )
    )
    query.left_join(securityEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(securityEntity.columns.id, positionEntity.columns.securityId)
        )
    )

    query.left_join(securityPriceEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(securityEntity.columns.id, securityPriceEntity.columns.securityId)
        )
    )
        .where(
        squel.expr().and(squelUtils.eql(1, 1))
            .and(squelUtils.eql(accountEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(accountEntity.columns.isDisabled, 0))
        );
    if (data.inModel === 'true') {

        query.join(modelEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(modelEntity.columns.id, portfolioEntity.columns.modelId)
            )
        )
    }
    if (data.search) {
        query.where(
            squel.expr().and(
                squel.expr()
                    .or(squelUtils.eql(accountEntity.columns.id, data.search))
                    .or(squelUtils.like(accountEntity.columns.name, data.search))
                    .or(squelUtils.like(accountEntity.columns.accountNumber, data.search))
            )
        )
    }
    query.group(accountEntity.columns.id);
    query.order(accountEntity.columns.name);
    if (data.search) {
        query.limit(20);
    }
    query = query.toString();

    logger.debug("Get simple account with value list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, data);
    });
};

AccountDao.prototype.getNewAccountList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.info("Get  New Account List dao: ");
    connection.query("CALL getNewAccountList()", function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch new account data in Dao (getNewAccountList()) ", result[0]);
    });
};

AccountDao.prototype.getAccountListWithNoPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.info("Get account list with No Portfolio  dao: ");
    connection.query("CALL getAccountListWithNoPortfolio()", function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch account list with No Portfolio Data in Dao (getAccountListWithNoPortfolio()) ", result[0]);
    });
};
//Get Account Detail by Account Id
AccountDao.prototype.getAccountDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get account detail dao: ");
    connection.query("CALL getAccountDetails(?,?)", [userId, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result) {
            return cb(null, result);
        }
        return cb("Unable to fetch account detail Data in Dao (getAccountDetail()) ", result);
    });
};

AccountDao.prototype.getAccountList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get account list dao: ");
    connection.query("CALL getAccountList(?,?)", [userId, data.filterId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch account list Data in Dao (getAccountList()) ", result[0]);
    });
};

// Get Aside Type 
AccountDao.prototype.getAsideType = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query;
    if (data.asideCashAmountType) {
        query = 'SELECT * from accountSetAsideCashAmountType ORDER BY setAsideCashAmountType ASC;';
    }
    if (data.asideCashExpirationType) {
        query = 'SELECT * from accountSetAsideCashExpirationType ORDER BY setAsideCashExpirationType ASC;';
    }
    if (data.asideCashTransactionType) {

        query = 'SELECT * from accountSetAsideCashTransactionType ORDER BY setAsideCashTransactionType ASC; ';
    }

    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

// Validate Aside Type 
AccountDao.prototype.validateAsideType = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = []
    var query;
    query = 'SELECT COUNT(*)  FROM accountSetAsideCashAmountType WHERE id = ' + data.cashAmountTypeId;
    connection.query(query, function (err, count) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (count) {
            result.count = count[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

// Validate Aside Expiration Type 
AccountDao.prototype.validateAsideTypeExpiration = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = []
    var query;
    query = 'SELECT COUNT(*)  FROM accountSetAsideCashExpirationType WHERE id = ' + data.expirationTypeId;
    connection.query(query, function (err, count) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (count) {
            result.count = count[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

// Validate Aside Transaction Type 
AccountDao.prototype.validateTransactionType = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = []
    var query;
    query = 'SELECT COUNT(*)  FROM accountSetAsideCashTransactionType WHERE id = ' + data.expirationValue;
    connection.query(query, function (err, count) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (count) {
            result.count = count[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

// Get Aside Details
AccountDao.prototype.getAsideDetails = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountId = data.accountId;
    var id = data.id;
    var query = 'SELECT ';
    query = query + ' asac.id AS id, ';
    query = query + ' asac.accountId AS accountId, ';
    query = query + ' asac.description AS description, ';
    query = query + ' asac.cashAmountType AS cashAmountTypeId, ';
    query = query + ' asac.cashAmount AS cashAmount, ';
    query = query + ' asac.expirationType AS expirationTypeId, ';
    query = query + ' asac.expireTransactionType AS transactionTypeId, ';
    query = query + ' asac.expireDate AS expireDate, ';
    query = query + ' asac.transactonAmountTolerance AS toleranceValue, ';
    query = query + ' asac.systemExpiredOn AS systemExpiredOn, ';
    //   query = query + ' asac.isReplenish AS isReplenish, ';
    query = query + ' asac.isDeleted AS isDeleted, ';
    query = query + ' asac.createdDate AS createdDate, ';
    query = query + ' u.userLoginId AS createdBy, ';
    query = query + ' asac.editedDate AS editedDate, ';
    query = query + ' u.userLoginId AS editedBy  ';
    query = query + ' FROM `accountSetAsideCash` AS asac ';
    query = query + ' INNER JOIN `account` ';
    query = query + ' AS a ON a.id = asac.accountId ';
    query = query + ' INNER JOIN `user` AS u ON asac.createdBy = u.id AND asac.editedBy = u.id ';
    query = query + ' WHERE asac.accountId = ' + accountId + ' AND asac.id = ' + id + ' AND asac.isDeleted = 0 ; ';
    logger.debug("Query : " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

// Add New Aside 
AccountDao.prototype.addAsideDetails = function (data, cb) {
    var userId = utilService.getAuditUserId(data.user);
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = 'INSERT INTO accountSetAsideCash(`accountId`,`description`,`cashAmountType`,`cashAmount`, ';
    var inputData = {
        accountId: data.accountId,
        description: data.description,
        cashAmountType: data.cashAmountTypeId,
        cashAmount: data.cashAmount,
        //  isReplenish: data.isReplenish,
        createdBy: userId,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        editedBy: userId,
        createdDate: currentDate,
        editedDate: currentDate
    };
    var queryData = inputData.accountId + ', "' + inputData.description + '" , ' + inputData.cashAmountType + ', ' + inputData.cashAmount + ', '

    if (data.expirationTypeId === 1) {
        var expirationValue = data.expirationValue ? data.expirationValue : null;

        query = query + ' `expirationType`, `expireDate` '
        queryData = queryData + data.expirationTypeId + ', ';
        if (data.expirationValue) {
            queryData = queryData + '"' + dateFormat(data.expirationValue, "isoDateTime") + '", ';
        } else {
            queryData = queryData + expirationValue + ', ';
        }
    }
    if (data.expirationTypeId === 2) {
        var expirationValue = data.expirationValue ? data.expirationValue : null;

        query = query + ' `expirationType`, `expireTransactionType`, `transactonAmountTolerance` '
        queryData = queryData + data.expirationTypeId + ', ';
        queryData = queryData + expirationValue + ', ';
        queryData = queryData + data.toleranceValue + ', ';
    }
    query = query + ', `isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`) VALUES (  '
    queryData = queryData + 0 + ',"' + inputData.createdDate + '","' + inputData.createdBy + '","' + inputData.editedDate + '","' + inputData.editedBy + '"';
    query = query + queryData + ') ';
    logger.debug("Query : " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

// Update Aside 
AccountDao.prototype.updateAsideDetails = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var queryData = {
        id: data.id,
        accountId: data.accountId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime()
    };
    if (data.description !== null) {
        queryData["description"] = data.description;
    }
    // if (data.isReplenish) {
    //     queryData["isReplenish"] = data.isReplenish;
    // }
    if (data.cashAmountTypeId !== null) {
        queryData["cashAmountType"] = data.cashAmountTypeId;
    }
    if (data.cashAmount !== null) {
        queryData["cashAmount"] = data.cashAmount;
    }
    if (data.expirationTypeId !== null) {
        queryData["expirationType"] = data.expirationTypeId;
        if (data.expirationTypeId === 1) {
            if (data.expirationValue) {
                queryData["expireDate"] = dateFormat(data.expirationValue, "isoDateTime");
            } else {
                queryData["expireDate"] = data.expirationValue;
            }
        }
        if (data.expirationTypeId === 2) {
            if (data.expirationValue) {
                queryData["expireTransactionType"] = data.expirationValue;
            }
            if (data.toleranceValue) {
                queryData["transactonAmountTolerance"] = data.toleranceValue;
            }
        }
    }
    var query = 'UPDATE accountSetAsideCash SET ? WHERE id = ? AND  accountId = ? AND isDeleted = 0 ';
    connection.query(query, [queryData, queryData.id, queryData.accountId], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

// Get All Aside List
AccountDao.prototype.getAllAsideList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountId = data.accountId;
    var id = data.id;
    var query = 'SELECT ';
    query = query + ' asac.id AS id, ';
    query = query + ' asac.description AS description, ';
    query = query + ' asac.cashAmountType AS cashAmountTypeId, ';
    query = query + ' asacat.setAsideCashAmountType AS cashAmountTypeName, ';
    query = query + ' asac.cashAmount AS cashAmount, ';
    query = query + ' asac.expirationType AS expirationTypeId, ';
    query = query + ' asacet.setAsideCashExpirationType AS expirationTypeName, ';
    query = query + ' asac.expireTransactionType AS transactionTypeId, ';
    query = query + ' asactt.setAsideCashTransactionType AS transactionTypeName, ';
    query = query + ' asac.expireDate AS expireDate, ';
    query = query + ' asac.transactonAmountTolerance AS toleranceValue, ';
    query = query + ' asac.systemExpiredOn AS systemExpiredOn, ';
    //   query = query + ' asac.isReplenish AS isReplenish, ';
    query = query + ' asac.isDeleted AS isDeleted, ';
    query = query + ' asac.createdDate AS createdDate, ';
    query = query + ' u.userLoginId AS createdBy, ';
    query = query + ' asac.editedDate AS editedDate, ';
    query = query + ' u.userLoginId AS editedBy  ';
    query = query + ' FROM `accountSetAsideCash` AS asac ';
    query = query + ' LEFT JOIN `account`  AS a ON a.id = asac.accountId ';
    query = query + ' LEFT JOIN `accountSetAsideCashAmountType`  AS asacat ON asacat.id = asac.cashAmountType ';
    query = query + ' LEFT JOIN `accountSetAsideCashExpirationType`  AS asacet ON asacet.id = asac.expirationType  ';
    query = query + ' LEFT JOIN `accountSetAsideCashTransactionType`  AS asactt ON asactt.id = asac.expireTransactionType  ';
    query = query + ' INNER JOIN `user` AS u ON asac.createdBy = u.id AND asac.editedBy = u.id ';
    query = query + ' WHERE asac.accountId = ' + accountId + ' AND asac.isDeleted = 0  ORDER BY asac.id ASC; ';
    logger.debug("Query : " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

// Delete Aside 
AccountDao.prototype.deleteAsideDetails = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var queryData = {
        id: data.id,
        accountId: data.accountId,
        isDeleted: 1,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime()
    };
    var query = 'UPDATE accountSetAsideCash SET ? WHERE id = ? AND  accountId = ? AND isDeleted = 0 ';
    connection.query(query, [queryData, queryData.id, queryData.accountId], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

// Validate Acoount 
AccountDao.prototype.validateAccount = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        id: data.id,
        accountId: data.accountId,
    };
    var query = 'SELECT COUNT(*) FROM account WHERE isDeleted = 0 AND isDisabled = 0  ';
    var query = query + ' AND id = ' + queryData.accountId + '';
    connection.query(query, function (err, count) {
        if (err) {
            return cb(err);
        }
        if (count) {
            result.count = count[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

// Validate  Aside
AccountDao.prototype.validateAside = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var result = []
    var queryData = {
        id: data.id,
        accountId: data.accountId,
    };
    var query = 'SELECT COUNT(*) FROM accountSetAsideCash WHERE isDeleted = 0 ';
    var query = query + ' AND id = ' + queryData.id + '';
    connection.query(query, function (err, count) {
        if (err) {
            return cb(err);
        }
        if (count) {
            result.count = count[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

// Get Model Level Type 
AccountDao.prototype.getModelLevelType = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var queryData = {
        accountId: data.accountId,
    };
    var query = ' SELECT DISTINCT  relatedType FROM `modelElements` ';
    query = query + '  WHERE id IN (SELECT modelElementId FROM `modelDetails` ';
    query = query + ' WHERE modelId = (SELECT modelId FROM `portfolio` ';
    query = query + ' WHERE id = (SELECT portfolioId FROM `account` ';
    query = query + ' WHERE isDeleted = 0 AND id = ' + queryData.accountId + '';
    query = query + ' ) AND isDeleted = 0 ) AND isDeleted = 0 ) AND relatedType IN ("CATEGORY","CLASS","SUBCLASS") AND isDeleted = 0 ORDER BY relatedType ASC ; ';

    logger.debug("Query : " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

// Get Model Node
// AccountDao.prototype.getModelNode = function (data, cb) {
//     var connection = baseDao.getConnection(data);
//     var queryData = {
//         accountId: data.accountId,
//         relatedType: data.relatedType
//     };

//     var query = ' SELECT  DISTINCT `id` as subModelId,`name` as subModelName FROM `modelElements` ';
//     query = query + '  WHERE id IN  ( ';
//     query = query + ' 	SELECT  DISTINCT modelElementId FROM `modelDetails`  	WHERE modelId = ( ';
//     query = query + ' SELECT modelId FROM `portfolio` 	WHERE id = ( ';
//     query = query + ' SELECT portfolioId FROM `account` ';

//     query = query + ' WHERE  isDeleted = 0 AND id = ' + queryData.accountId + '';

//     query = query + ' ) AND isDeleted = 0 ) AND isDeleted = 0 ) ';
//     query = query + ' AND relatedType = ' + '"' + queryData.relatedType + '"' + '  AND isDeleted = 0 ORDER BY `name` ASC ; ';

//     logger.debug("Query : " + query);
//     connection.query(query, function (err, result) {
//         if (err) {
//             logger.error(err);
//             return cb(err);
//         }
//         return cb(null, result);
//     });
// };


AccountDao.prototype.getModelNode = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var queryData = {
        accountId: data.accountId,
        relatedType: data.relatedType
    };

    var query = ' SELECT  ME.id as subModelId,ME.name as subModelName,MO.id as modelId ,MD.id as modelDetailId  from `model` as MO   ';

    query = query + ' INNER JOIN `modelDetails` as MD  on  MO.id = MD.modelId AND MD.isDeleted=0 ';
    query = query + ' INNER JOIN `modelElements` as ME  on  ME.id = MD.modelElementId AND ME.isDeleted=0 ';
    query = query + ' INNER JOIN  `portfolio` as PF  on PF.modelId = MO.id AND PF.isDeleted=0 ';
    query = query + ' INNER JOIN `account`  as ACC  on  ACC.portfolioId = PF.id AND ACC.isDeleted=0 ';
    query = query + ' WHERE ACC.id = ' + queryData.accountId + ' AND MO.isDeleted = 0  AND relatedType = ' + '"' + queryData.relatedType + '"' + ' ORDER BY ME.name ASC; ';

    logger.debug("Query : " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};
// Set Replenish
AccountDao.prototype.setReplenish = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var returnValue = null;
    var queryData = {
        // id: data.accountId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime()
    };
    if (data.isReplenish === 'true') {
        queryData["isReplenish"] = 1;
    }
    if (data.isReplenish === 'false' || data.isReplenish === null) {
        queryData["isReplenish"] = 0;
    }
    var query = 'UPDATE account SET ? WHERE id = ?  AND isDeleted = 0 ';
    logger.debug("Query : " + query);
    connection.query(query, [queryData, data.accountId], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

/* This Query used to get all securities by account id. This data is showing in trade->model tolerance */
AccountDao.prototype.getModelToleranceSecurityByAccount = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    firmConnection.query("CALL getModelToleranceSecurityForPortfolio(?)", portfolioId, function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

AccountDao.prototype.getSmaNodeList = function (data, cb) {

    var connection = baseDao.getConnection(data);
    logger.debug("Get Sma node object", JSON.stringify(data.id));

    var query = [];
    query.push('SELECT ASA.id, ASA.modelId,ASA.accountId ,ASA.modelDetailId,ASA.subModelId as subModelId,ASA.levelId as levelId ,ASA.isDeleted,ME.name as subModelName, ');
    query.push(' ASA.createdDate as createdOn ,ASA.editedDate as editedOn,ASA.weightPercent as weightPercent,');
    query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    query.push(' from  accountSMAAllocation   as ASA ');
    query.push(' left outer join user as USER  on USER.id = ASA.createdBy ');
    query.push(' left outer join user as USERS  on USERS.id = ASA.editedBy ');
    query.push(' left outer join modelElements as ME  on ME.id = ASA.subModelId ');
    query.push(' WHERE ASA.accountId= ' + data.id + '');
    query.push(' AND ASA.isDeleted=0 ');
    query = query.join("");
    logger.debug("Get Sma node Query" + query);;

    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        var smaList = [];
        if (result.length > 0) {
            result.forEach(function (sma) {
                smaList.push(sma);
            });
        }

        return cb(null, smaList);
    });
};


AccountDao.prototype.getReplenish = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT isReplenish FROM `account` WHERE id = ? AND isDeleted = 0  ');

    query = query.join("");
    logger.debug("Get accounts with securities Query" + query);

    connection.query(query, data.accountId, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

AccountDao.prototype.getSimpleAccountListwithPortfolioName = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get account list with  Portfolio name dao: ");
    connection.query("CALL searchSimpleAccountWithPortfolioName(?,?)", [userId, data.search], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch account list with  Portfolio name in Dao (getAccountListWithNoPortfolio()) ", result[0]);
    });
};

AccountDao.prototype.getIdList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Get Not  active to ID List");

    var idList = [];
    data.weightings.forEach(function (sma) {
        if (sma.id !== null) {
            idList.push(sma.id);
        }
    });


    if (idList.length > 0) {
        var query = 'select id  from accountSMAAllocation  '
            + ' where id not in (' + idList + ') and accountId= ' + data.accountId + '  ';

    }
    else {
        var query = 'select id  from accountSMAAllocation where accountId= ' + data.accountId + ' ';

    }

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
};

AccountDao.prototype.deleteIdList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("delete Id List dao");

    var deleteIdList = [];
    data.idList.forEach(function (sma) {
        if (sma.id !== null) {
            deleteIdList.push(sma.id);
        }
    });
    if (data.accountId) {
        var query = 'delete  from accountSMAAllocation  '

            + ' where id  in (' + deleteIdList + ')  and accountId= ' + data.accountId + '  ';
    }


    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });

};

AccountDao.prototype.deleteSmaAssetCategory = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("delete deleteSmaAssetCategory() ");


    var query = [];
    query.push(' update smaAssetCategory  set ? ');
    if (Array.isArray(data.accountId)) {
        query.push(' where accountId in (?) ');
    } else {
        query.push(' where accountId = ? ');
    }
    if (data.modelElementId) {
        query.push(" AND assetCategoryId = ? ");
    }

    query = query.join("");
    var queryString = connection.query(query, [data.entity, data.accountId, data.modelElementId], function (err, result) {
        debug.log(queryString.sql);
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

AccountDao.prototype.deleteSmaAssetClass = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("delete deleteSmaAssetClass() ");


    var query = [];
    query.push(' update smaAssetClass  set ? ');
    if (Array.isArray(data.accountId)) {
        query.push(' where accountId in (?) ');
    } else {
        query.push(' where accountId = ? ');
    }
    if (data.modelElementId) {
        query.push(" AND assetClassId = ? ");
    }

    query = query.join("");
    var queryString = connection.query(query, [data.entity, data.accountId, data.modelElementId], function (err, result) {
        logger.debug(queryString.sql); if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

AccountDao.prototype.deleteSmaAssetSubClass = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("delete deleteSmaAssetSubClass() ");


    var query = [];
    query.push(' update smaSecuritySubClass  set ? ');
    if (Array.isArray(data.accountId)) {
        query.push(' where accountId in (?) ');
    } else {
        query.push(' where accountId = ? ');
    }
    if (data.modelElementId) {
        query.push(" AND subClassId = ? ");
    }

    query = query.join("");
    var queryString = connection.query(query, [data.entity, data.accountId, data.modelElementId], function (err, result) {
        logger.debug(queryString.sql);
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};


AccountDao.prototype.addSmaNode = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var arr = data.weightings;


    if (data) {
        var query = 'INSERT INTO accountSMAAllocation(`id`,`modelId`,`modelDetailId`,`weightPercent`,`subModelId`,`levelId`,`accountId`,`isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`) VALUES';
        var inputData = {

            accountId: data.accountId,
            createdBy: userId,
            isDeleted: data.isDeleted ? data.isDeleted : 0,
            editedBy: userId,
            createdDate: currentDate,
            editedDate: currentDate,
            selectedLevelId: data.selectedLevelId,

        };


        var queryData = inputData.selectedLevelId + ',' + inputData.accountId + ',0, "' + inputData.createdDate + '","' + inputData.createdBy + '","' + inputData.editedDate + '","' + inputData.editedBy;

        arr.forEach(function (sma) {

            query = query + '(' + sma.id + ',' + sma.modelId + ',' + sma.modelDetailId + ',' + sma.weightPercent + ',' + sma.subModelId + ',' + queryData + '"),';

        }, this);
        query = query.substr(0, query.length - 1);
        query = query + ' ON DUPLICATE KEY UPDATE   id = VALUES(id),modelId=VALUES(modelId),modelDetailId=VALUES(modelDetailId),weightPercent=VALUES(weightPercent),subModelId=VALUES(subModelId),levelId=VALUES(levelId)';
    }



    logger.debug("Create SMA query: " + query);
    connection.query(query, queryData, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        var smaList = [];
        if (result.length > 0) {
            result.forEach(function (sma) {
                smaList.push(sma);

            });
        }
        return cb(null, result);

    });
};

/* This Query used to get all sleeve account which are outOfTolerance by security id. This data is showing in trade->model analysis */
AccountDao.prototype.getAccountsWithOutOfToleranceSecurity = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    firmConnection.query("CALL getOutOfToleranceAccountsSleevedPortfoliosbySecurity(?,?)", [assetId, modelId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all sleeve account which are outOfTolerance by category id. This data is showing in trade->model analysis */
AccountDao.prototype.getAccountsWithOutOfToleranceCategory = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    firmConnection.query("CALL getOutOfToleranceAccountsSleevedPortfoliosbyAssetCategory(?,?)", [assetId, modelId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all sleeve account which are outOfTolerance by class id. This data is showing in trade->model analysis */
AccountDao.prototype.getAccountsWithOutOfToleranceClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    firmConnection.query("CALL getOutOfToleranceAccountsSleevedPortfoliosbyAssetClass(?,?)", [assetId, modelId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all sleeve account which are outOfTolerance by subclass id. This data is showing in trade->model analysis */
AccountDao.prototype.getAccountsWithOutOfToleranceSubClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    firmConnection.query("CALL getOutOfToleranceAccountsSleevedPortfoliosbyAssetClass(?,?)", [assetId, modelId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}
// Delete SMA node functionality
AccountDao.prototype.deleteSmaNode = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("delete Sma Node dao");

    var query = null;
    if (data.accountId) {
        query = 'delete  from accountSMAAllocation  '
            + ' where accountId= "' + data.accountId + '" ';
    }

    if (data.modelId) {
        query = 'update accountSMAAllocation  set ? '
            + ' WHERE modelId = ? ';
        if (data.modelDetailId) {
            query += ' AND modelDetailId = ? '
        }
    }
    var queryString = connection.query(query, [data.entity, data.modelId, data.modelDetailId], function (err, result) {
        logger.debug(queryString.sql);
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });

};

AccountDao.prototype.getSmasForModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("getSmasForModel()");

    var query = null;
    query = 'select * from accountSMAAllocation  '
        + ' where modelId = "' + data.modelId + '" AND isDeleted = 0 ';

    var queryString = connection.query(query, function (err, result) {
        console.log(queryString.sql);
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });

};

AccountDao.prototype.getPortfolios = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("getSmasForModel()");

    var id = data.accountId;
    var query = null;
    query = 'Select acc.id as id, acc.portfolioId as portfolioId from account acc where acc.id = ?';

    var queryString = connection.query(query, [id],function (err, result) {
        console.log(queryString.sql);
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });

};

module.exports = AccountDao;