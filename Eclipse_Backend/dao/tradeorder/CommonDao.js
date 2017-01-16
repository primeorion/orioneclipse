"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');
var util = require('util');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');

var CommonDao = function() { }

CommonDao.prototype.generateTrade = function(data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var trades = data.trades;
    var query;

    // query.push(" INSERT INTO trades (accountId, portfolioId, tradeInstanceId, securityId, price, custodianId, positionId, isDeleted ");
    // query.push(" ) VALUES ");
    // query.push(" (" + data.trade.accountId + ", " + data.trade.portfolioId + ", " + data.trade.instanceId);
    // query.push(", " + data.trade.securityId + ", " + data.trade.price + ", 50, 2, 0 )");
   
    query = " INSERT INTO trades (accountId, portfolioId, securityId, price, orderQty, action, custodianId, positionId, isSendImmediately, isEnabled, tradeAmount, tradeInstanceId, isDeleted , createdDate, createdBy, editedDate, editedBy";
    query = query + " ) VALUES ";
    var commonData = data.tradeInstanceId + ' , 0 ,' + '"' + currentDate + '" ,' + userId + ', ' + '"' + currentDate + '" ,' + userId;
    trades.forEach(function(trade) {
        if(trade.isSendImmediately == undefined){
            trade.isSendImmediately == false;
        }
        query = query + '( ' + trade.accountId + ',' + trade.portfolioId + ',' + trade.securityId + ',' + trade.price + ', '+ trade.orderQty + ',"' + trade.tradeActionId + '", '
        + trade.custodianId +','+ trade.positionId +','+ trade.isSendImmediately +','+ trade.isEnabled +',' + trade.tradeAmount +',' + commonData + ' ),';
    }, this);
    query = query.substr(0, query.length - 1);
    logger.debug(query);
    connection.query(query, function(err, result) {
        if (err) {
            cb(err, null);
        }
        cb(null, result);
    });
};


CommonDao.prototype.generateTrade1 = function(data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var trade = data.tradeData;
    var query;
    query = " INSERT INTO trades (accountId, portfolioId, securityId, price, orderQty, tradeActionId, custodianId, positionId ";
    query = query + " , isSendImmediately, isEnabled, tradeAmount, originalOrderQty, orderPercent, accountValue, modelId, cashValuePostTrade ";
    query = query + " , tradeInstanceId, isDeleted , createdDate, createdBy, editedDate, editedBy ";
    query = query + " ) VALUES ";
    var commonData = data.tradeInstanceId + ' , 0 ,' + '"' + currentDate + '" ,' + userId + ', ' + '"' + currentDate + '" ,' + userId;
        if(trade.isSendImmediately == undefined){
            trade.isSendImmediately == false;
        }
        query = query + '( ' + trade.accountId + ',' + trade.portfolioId + ',' + trade.securityId + ',' + trade.price + ', '+ trade.orderQty + ',' + trade.tradeActionId + ', '
        + trade.custodianId +','+ trade.positionId +','+ trade.isSendImmediately +','+ trade.isEnabled +',' + trade.tradeAmount +',' + trade.orderQty + ','
        + trade.orderPercent + ',' + trade.accountValue + ',' + trade.modelId + ',' + trade.cashValuePostTrade + ',' + commonData + ' )';
    logger.debug(query);
    connection.query(query, function(err, result) {
        if (err) {
            return cb(err, null);
        }
        cb(null, result);
    });
};

CommonDao.prototype.generateTradeOrderMessages = function(data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var warningMessages = data.warningMessages;
    var query;
    query = " INSERT INTO tradeOrderMessageAssn (tradeOrderMessageId, tradeId, messageArguments";
    query = query + " ) VALUES ";
    warningMessages.forEach(function(warningMessage) {
        
        query = query + '( (SELECT id from tradeOrderMessage TOM where shortCode="'+ warningMessage.shortCode 
         + '"),' + data.tradeId + ',"' + warningMessage.arguments + '" ),';
    }, this);
    query = query.substr(0, query.length - 1);
    logger.debug(query);    
    connection.query(query, function(err, result) {
        if (err) {
            return cb(err, null);
        }
        return cb(null, result);
    });
};

CommonDao.prototype.getAccountsSecuritiesTaxLotsForPortfolio = function(data, cb) {
    var connection = baseDao.getConnection(data);
    var query = "CALL getAccountsSecuritiesTaxLotsForRebalancer(?,'PORTFOLIO')";
    var portfolioId = data.id;
    connection.query(query, [portfolioId], function(err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CommonDao.prototype.getAccountsSecuritiesTaxLotsForAccount = function(data, cb) {
    var connection = baseDao.getConnection(data);
    var query = "CALL getAccountsSecuritiesTaxLotsForRebalancer(?,'ACCOUNT')";
    var accountId = data.id;
    connection.query(query, [accountId], function(err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CommonDao.prototype.getPreferencesValuesForAccount = function(data, cb) {
    var connection = baseDao.getConnection(data);
    var query = "CALL getPreferencesValuesForRebalancer(?,'ACCOUNT')";
    var accountId = data.id;
    connection.query(query, [accountId], function(err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CommonDao.prototype.getPreferencesValuesForPortfolio = function(data, cb) {
    var connection = baseDao.getConnection(data);
    var query = "CALL getPreferencesValuesForRebalancer(?,'PORTFOLIO')";
    var portfolioId = data.id;
    connection.query(query, [portfolioId], function(err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
module.exports = CommonDao;


