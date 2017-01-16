"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');
var util = require('util');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
var analysisDao = new(require('dao/post_import_analysis/AnalysisDao'))();
var localCache = require('service/cache').local;
var unique = require('helper').uniqueIdGenerator;
var dbConnection = require('./../../middleware/DBConnection.js');

var TradeImportDao = function () { }

TradeImportDao.prototype.getValidAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];
    if(data.accountIdList.length>0 || data.accountNumberList.length > 0) {
        var query = ' SELECT id, accountId, accountNumber FROM `account` WHERE  ';
            if (data.accountIdList.length >0) {
                query = query + '  accountId IN ( ' + data.accountIdList + ') ';
            }
            if (data.accountNumberList.length >0) {
                query = query + '  accountNumber IN ( ' + data.accountNumberList + ') ';
            }
        
        logger.debug("Query: " + query);
        connection.query(query, function (err, data) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            return cb(null, data);
        });
   }
   else {
         return cb(null, []);
   }

};


TradeImportDao.prototype.getValidSecurities = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];
    if(data.securityList.length>0) {
        var query = ' SELECT id, name, symbol FROM `security` WHERE  ';
        if (data.securityList) {
            query = query + '  symbol IN ( ' + data.securityList + ') ';
        }
        logger.debug("Query: " + query);
        connection.query(query, function (err, data) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            return cb(null, data);
        });
   }
   else {
         return cb(null, []);
   }

};


module.exports = TradeImportDao;


