"use strict";

var moduleName = __filename;

var helper = require('helper');

var UtilService = require("service/util/UtilService");

var logger = helper.logger(moduleName);
var utilService = new UtilService();

var DashboardConverter = function () { }

DashboardConverter.prototype.getModelToResponseAccount = function(data, cb) {
    logger.info(" Account Dashboard  Converter called (getModelToResponse())");
    var accountList = [];
    var total, totalPercent = 0;
    var accountResponse = {}, temp = {};

    if( data[0].length == 0 ) {
        return cb(null, accountList);
    }
    total = data[0][0].total;
    data[0].forEach(function (data) {
        temp = {};
        temp.name = data.name;
        temp.noOfAccounts = data.accountNumber;
        temp.percent = data.percent;
        totalPercent += data.percent;
        accountList.push(temp);
    });
    if( data[1].type == 'firm' ) {
        accountResponse.firms = accountList;
    }else if(  data[1].type == 'model' ) {
        accountResponse.models = accountList;
    } else if( data[1].type == 'advisor' ) {
        accountResponse.advisors = accountList;
    }

    accountResponse.totalPercent = totalPercent;
    accountResponse.totalManagedAccount = total;

    return cb(null, accountResponse);
};

DashboardConverter.prototype.getModelToResponseAUM = function(data, cb) {
    logger.info(" Account Dashboard  Converter called (getModelToResponse())");
    var aumList = [];
    var total, totalPercent = 0, totalOneDayBefore, percentDifference;
    var aumResponse = {}, temp = {};

    if( data[0].length == 0 ) {
        return cb(null, aumList);
    }
    total = data[0][0].total;
    totalOneDayBefore = data[0][0].totalOneDayBefore;
    percentDifference = data[0][0].percentDifference;
    data[0].forEach(function (data) {
        temp = {};
        temp.name = data.name;
        temp.marketValue = data.marketValue;
        temp.percent = data.percent;
        totalPercent += data.percent;
        aumList.push(temp);
    });
    if( data[1].type == 'firm' ) {
        aumResponse.firms = aumList;
    }else if(  data[1].type == 'model' ) {
        aumResponse.models = aumList;
    } else if( data[1].type == 'advisor' ) {
        aumResponse.advisors = aumList;
    }

    aumResponse.totalMarketValue = total;
    aumResponse.totalPercent = totalPercent;
    aumResponse.percentChange = percentDifference;
    aumResponse.totalOneDayBefore = totalOneDayBefore;

    return cb(null, aumResponse);
};


module.exports = DashboardConverter;
