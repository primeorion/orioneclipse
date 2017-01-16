"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var localCache = require('service/cache').local;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var accountEntity = require("entity/account/Account.js");
var userEntity = require("entity/user/User.js");
var accountTypeEntity = require("entity/account/AccountType.js");
var portfolioEntity = require("entity/portfolio/Portfolio.js");
var teamPortfolioAccessEntity = require("entity/team/TeamPortfolio.js");
var teamEntity = require("entity/team/Team.js");
var userTeamEntity = require("entity/user/UserTeam.js");
var positionEntity = require("entity/holding/Position.js");
var securityEntity = require("entity/security/Security.js");
var transactionEntity = require("entity/transaction/Transaction.js");
var taxlotEntity = require("entity/taxlot/Taxlot.js");
var securityPriceEntity = require("entity/security/SecurityPrice.js");

var HoldingDao = function () { }

HoldingDao.prototype.getSearchHoldingDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = squel.select()
        .field(positionEntity.columns.id, "id")
        .field(accountEntity.columns.accountNumber, "accountNumber")
        .field(accountEntity.columns.name, "accountName")
        .field(positionEntity.columns.isDeleted, "isDeleted")
        .field(positionEntity.columns.createdDate, "createdDate")
        .field(positionEntity.columns.editedDate, "editedDate")
        .field(positionEntity.columns.accountId, "accountId")
        .field(securityPriceEntity.columns.price, "price")
        .field(positionEntity.columns.quantity, "shares")
        .field("COALESCE(" + "Sum(" + securityPriceEntity.columns.price + " * " + positionEntity.columns.quantity + ")" + ",0)", "value")
        .field(userEntity.usCreated.userLoginId, 'createdBy')
        .field(userEntity.usEdited.userLoginId, 'editedBy')
        .field(securityEntity.columns.name, "securityName")
        .field(securityEntity.columns.symbol, "securitySymbol")
        .field(portfolioEntity.columns.name, "portfolioName")
        .from(positionEntity.tableName)

    query.left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, positionEntity.columns.createdBy)
    )

    query.left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, positionEntity.columns.editedBy)
    )

    query.left_join(accountEntity.tableName, null, squel.expr()
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
    query.left_join(portfolioEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(portfolioEntity.columns.id, accountEntity.columns.portfolioId)
        )
    )
        .where(
        squel.expr()

            .and(squelUtils.eql(accountEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(securityEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(positionEntity.columns.isDeleted, 0))
        );

    if (data.accountId) {
        if (data.accountId) {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(positionEntity.columns.id, data.simpleSearch))
                        .or(squelUtils.like(securityEntity.columns.name, data.simpleSearch))
                )
                    .and(squelUtils.eql(positionEntity.columns.accountId, data.accountId))

            )
        } else {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(positionEntity.columns.id, data.simpleSearch))
                        .or(squelUtils.like(securityEntity.columns.name, data.simpleSearch))
                )
                    .and(squelUtils.eql(positionEntity.columns.accountId, data.accountId))

            )
        }
    }
    if (data.portfolioId) {
        if (data.portfolioId) {
            query.where(
                squel.expr()
                    .and(
                    squel.expr()
                        .or(squelUtils.eql(positionEntity.columns.id, data.simpleSearch))
                        .or(squelUtils.like(securityEntity.columns.name, data.simpleSearch))
                    )
                    .and(squelUtils.eql(accountEntity.columns.portfolioId, data.portfolioId))

            )
        } else {
            query.where(
                squel.expr()
                    .and(
                    squel.expr()
                        .or(squelUtils.eql(positionEntity.columns.id, data.simpleSearch))
                        .or(squelUtils.like(securityEntity.columns.name, data.simpleSearch))
                    )
                    .and(squelUtils.eql(accountEntity.columns.portfolioId, data.portfolioId))

            )
        }
    }

    query.group(positionEntity.columns.id);
    query.order(securityEntity.columns.name);
    query = query.toString();

    logger.debug("Get holding list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, data);
    });
};

HoldingDao.prototype.getHoldingTransactions = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = squel.select()
        .field(transactionEntity.columns.id, "id")
        .field(transactionEntity.columns.price, "price")
        .field(transactionEntity.columns.type, "type")
        .field(transactionEntity.columns.tradeDate, "tradeDate")
        .field(userEntity.usCreated.userLoginId, 'createdBy')
        .field(userEntity.usEdited.userLoginId, 'editedBy')
        .field(transactionEntity.columns.amount, "amount")
        .field(transactionEntity.columns.quantity, "units")
        .field(transactionEntity.columns.tradeCost, "cost")
        .field(transactionEntity.columns.isDeleted, "isDeleted")
        .field(transactionEntity.columns.createdDate, "createdDate")
        .field(transactionEntity.columns.editedDate, "editedDate")
        .field(transactionEntity.columns.accountId, "accountId")
        .from(transactionEntity.tableName)

    query.left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, transactionEntity.columns.createdBy)
    )

    query.left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, transactionEntity.columns.editedBy)
    )


    query.left_join(securityEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(securityEntity.columns.id, transactionEntity.columns.securityId)
        )
    )

    // query.join(positionEntity.tableName, positionEntity.positionAcc.alias,
    //     squelUtils.joinEql(positionEntity.positionAcc.accountId, transactionEntity.columns.accountId)

    // )

    // query.join(positionEntity.tableName, positionEntity.positionSec.alias,
    //     squelUtils.joinEql(positionEntity.positionSec.securityId, transactionEntity.columns.securityId)


    // )
    
     query.left_join(positionEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(positionEntity.columns.securityId, transactionEntity.columns.securityId))
        .and(squelUtils.joinEql(positionEntity.columns.accountId, transactionEntity.columns.accountId))
    )
        .where(
        squel.expr()
            .and(squelUtils.eql(1, 1))
            .and(squelUtils.eql(securityEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(transactionEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(positionEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(positionEntity.columns.id, data.id))
        );


    query.group(transactionEntity.columns.id);
    query = query.toString();

    logger.debug("Get holding list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, data);
    });
};

HoldingDao.prototype.getHoldingTaxlots_old = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = squel.select()
        .field(taxlotEntity.columns.id, "id")
        .field(taxlotEntity.columns.dateAcquired, "dateAcquired")
        .field(taxlotEntity.columns.quantity, "quantity")
        .field(taxlotEntity.columns.costAmount, "costAmount")
        .field(userEntity.usCreated.userLoginId, 'createdBy')
        .field(userEntity.usEdited.userLoginId, 'editedBy')
        .field(taxlotEntity.columns.costPerShare, "costPerShare")
        .field(taxlotEntity.columns.isDeleted, "isDeleted")
        .field(taxlotEntity.columns.createdDate, "createdDate")
        .field(taxlotEntity.columns.editedDate, "editedDate")


        .from(taxlotEntity.tableName)

    query.left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, taxlotEntity.columns.createdBy)
    )

    query.left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, taxlotEntity.columns.editedBy)
    )


    query.left_join(securityEntity.tableName, null, squel.expr()
        .and(squelUtils.joinEql(securityEntity.columns.id, taxlotEntity.columns.securityId)
        )
    )

    query.join(positionEntity.tableName, positionEntity.positionAcc.alias,
        squelUtils.joinEql(positionEntity.positionAcc.accountId, taxlotEntity.columns.accountId)

    )

    query.join(positionEntity.tableName, positionEntity.positionSec.alias,
        squelUtils.joinEql(positionEntity.positionSec.securityId, taxlotEntity.columns.securityId)


    )
        .where(
        squel.expr()
            .and(squelUtils.eql(1, 1))
            .and(squelUtils.eql(securityEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(taxlotEntity.columns.isDeleted, 0))
            .and(squelUtils.eql(positionEntity.positionSec.isDeleted, 0))
        );


    query.group(taxlotEntity.columns.id);
    query = query.toString();

    logger.debug("Get holding list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, data);
    });
};

//Get taxlot detail by Holding Id
HoldingDao.prototype.getHoldingTaxlots = function (data, cb) {
    var connection = baseDao.getConnection(data);
    connection.query("CALL getHoldingTaxlot(?)", [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch taxlot List Data in Dao (getList()) ", result[0]);
    });
};
//Get Holding Filters 
HoldingDao.prototype.getHoldingFilters = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT id,name FROM holdingFilterType';
    logger.debug("Query: " + query);

    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        var holdingFilterList = [];
        data.forEach(function (holdingFilter) {
            holdingFilterList.push(holdingFilter);
        });
        return cb(null, holdingFilterList);

    });
};

//Get Holding by Portfolio Id
HoldingDao.prototype.getHoldingByPortId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    connection.query("CALL getHoldingByPortfolioId(?,?)", [data.id, data.filter], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch holding List Data in Dao (getList()) ", result[0]);
    });
};

//Get Holding by Account Id
HoldingDao.prototype.getHoldingByAccountId = function (data, cb) {
    var connection = baseDao.getConnection(data);


    connection.query("CALL getHoldingByAccountId(?,?)", [data.id, data.filter], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch holding list Data in Dao (getList()) ", result[0]);
    });
};

HoldingDao.prototype.getHoldingDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    //  var userId = utilService.getAuditUserId(data.user);
    connection.query("CALL getHoldingById(?)", [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch HoldingById Data in Dao (getHoldingDetail()) ", result[0]);
    });
};



HoldingDao.prototype.getAccAndPortWithHoldingValue = function (data, cb) {
    var connection = baseDao.getConnection(data);

    connection.query("CALL getAccountAndPortfolioWithHoldingValue(?)", [data.search], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (result[0]) {
            return cb(null, result[0]);
        }
        return cb("Unable to fetch HoldingById Data in Dao (getHoldingDetail()) ", result[0]);
    });
};

module.exports = HoldingDao;   
