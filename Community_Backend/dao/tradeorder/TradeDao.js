"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');

var TradeDao = function () { }
//WE donot use model entity concept in get List api because it will increase loops
TradeDao.prototype.getTradeExecutionTypeList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(" SELECT TE.id,TE.name,TE.isDeleted,TE.createdDate as createdOn, ");
    query.push(" usCreated.userLoginId as createdBy, ");
    query.push(" TE.editedDate as editedOn, ");
    query.push(" usEdited.userLoginId as editedBy ");
    query.push(" from tradeExecutionType as TE ");
    query.push(" left outer join user as usCreated on usCreated.id = TE.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = TE.editedBy ");
    query.push(" WHERE 1=1 ");

    if (data.search) {
        query.push(" AND ");
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(" (TE.id= '" + data.search + "' OR ");
        }
        query.push(" TE.name LIKE '%" + data.search + "%' ");
        if (data.search.match(/^[0-9]+$/g)) {
             query.push(' ) ');
         }
    }
    
    query.push(' AND TE.isDeleted = 0 ');

    query = query.join("");
    logger.debug("Query: " + query);
    
    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, resultSet);
    });
};

TradeDao.prototype.getTradeListByPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var query = [];
    query.push(" SELECT T.id,T.action,T.tradeAmount,T.createdDate as createdOn, ");
    query.push(" T.portfolioId,portfolio.name as portfolioName, ");
    query.push(" T.securityId, security.name as securityName, ");
    query.push(" T.accountId, account.accountNumber as accountNumber, accountType.name as accountType ");
    query.push(" FROM trades as T ");
    query.push(" LEFT OUTER JOIN portfolio as portfolio on portfolio.id = T.portfolioId ");
    query.push(" LEFT OUTER JOIN security as security on security.id = T.securityId ");
    query.push(" LEFT OUTER JOIN account as account on account.id = T.accountId ");
    query.push(" LEFT OUTER JOIN accountType as accountType on accountType.id = account.accountTypeId ");
    query.push(" WHERE T.portfolioId = ? ");
    if (data.tradeCode) {
        query.push(" AND ");
        query.push(" T.tradeCode= '" + data.tradeCode +"'");
    }
  //  query.push(" GROUP BY T.createdDate ORDER BY T.createdDate DESC ");
    query = query.join("");
    logger.debug("Query: " + query);
    
    connection.query(query, portfolioId, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

module.exports = TradeDao;