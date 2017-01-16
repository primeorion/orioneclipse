"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao.js');
var util = require('util');

var DashboardDao = function () { }

DashboardDao.prototype.getDashboardAccountDetails = function (inputData, cb) {
    var connection = baseDao.getCommunityDBConnection(inputData);

    var query = 'CALL accounts_dashboardSummary(' + inputData.user.userId + ',"'+ inputData.type +'","' + inputData.date + '")';

    logger.info("get dashboard account summary ", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.debug('Error on get account dashboard  summary is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

DashboardDao.prototype.getDashboardAumDetails = function (inputData, cb) {
    var connection = baseDao.getCommunityDBConnection(inputData);

    var query = 'CALL aum_dashboardSummary(' + inputData.user.userId + ',"'+ inputData.type +'","' + inputData.date + '")';

    logger.info("get dashboard aum summary ", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.debug('Error on get aum dashboard  summary is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

DashboardDao.prototype.getCashFlowSummaryData = function (inputData, cb){
    var connection = baseDao.getCommunityDBConnection(inputData);
    connection.query('CALL cashflow_total_dashboardSummary(?,?,?,?)', [inputData.user.userId, inputData.type, inputData.startDate, inputData.endDate], function (err, summaryResult) {
        if (err) {
            return cb(err);
        }
        return cb(null, summaryResult);
    });
}

module.exports = DashboardDao;