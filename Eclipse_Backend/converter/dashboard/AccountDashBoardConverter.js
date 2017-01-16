"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var AccountDashBoardResponse = require("model/dashboard/AccountDashBoardResponse.js");

var util = require('util');
var messages = config.messages;
var logger = helper.logger(moduleName);

var AccountDashBoardConverter = function () { }

AccountDashBoardConverter.prototype.accountDashBoardResponse = function (data, cb) {
    if (data.length > 1) {
        logger.debug("Converting data to account dashboard in accountDashBoardResponse()");

        var value = data[0][0] ? data[0][0] : [];
        var accounts = data[1][0] ? data[1][0] : [];
        var issues = data[2][0] ? data[2][0] : [];
        var bars = data[3][0] ? data[3][0] : [];
        var analyticesDate = data[4][0] ? data[4][0] : [];
        var accountDashBoardResponse = new AccountDashBoardResponse();
      
        accountDashBoardResponse.value = {};
        accountDashBoardResponse.dateTime =  analyticesDate.dateTime ? analyticesDate.dateTime : null;;
        accountDashBoardResponse.value.total = value.total ? value.total : 0;
        accountDashBoardResponse.value.changeValueAmount = value.changeValueAmount ? value.changeValueAmount : 0;
        accountDashBoardResponse.value.changeValuePercent = value.changeValuePercent ? value.changeValuePercent : 0;
        accountDashBoardResponse.value.status = value.changeValueStatus ? value.changeValueStatus : null;

        accountDashBoardResponse.accounts = {};
        accountDashBoardResponse.accounts.total = accounts.total ? accounts.total : 0;
        accountDashBoardResponse.accounts.existing = accounts.existing ? accounts.existing : 0;
        accountDashBoardResponse.accounts.new = accounts.new ? accounts.new : 0;

        accountDashBoardResponse.issues = {};
        accountDashBoardResponse.issues.total = issues.total ? issues.total : 0;
        accountDashBoardResponse.issues.errors = issues.errors ? issues.errors : 0;
        accountDashBoardResponse.issues.warnings = issues.warnings ? issues.warnings : 0;

        accountDashBoardResponse.bars = {};
        accountDashBoardResponse.bars.systematic = bars.systematic ? bars.systematic : 0;
        accountDashBoardResponse.bars.accountWithMergeIn = bars.accountWithMergeIn ? bars.accountWithMergeIn : 0;
        accountDashBoardResponse.bars.accountWithMergeOut = bars.accountWithMergeOut ? bars.accountWithMergeOut : 0;
        accountDashBoardResponse.bars.newAccount = bars.newAccount ? bars.newAccount : 0;
        accountDashBoardResponse.bars.accountWithNoPortfolio = bars.accountWithNoPortfolio ? bars.accountWithNoPortfolio : 0;
        accountDashBoardResponse.bars.toDo = bars.toDo ? bars.toDo : 0;
        accountDashBoardResponse.bars.sma = bars.sma ? bars.sma : 0;
        accountDashBoardResponse.bars.accountWithDataError = bars.accountWithDataError ? bars.accountWithDataError : 0;
        accountDashBoardResponse.bars.accountWithPedingTrades = bars.accountWithPedingTrades ? bars.accountWithPedingTrades : 0;


        return cb(null, accountDashBoardResponse);
    }
    else {
        return cb("Error in Getting Data from DB", accountDashBoardResponse);
    }
};

module.exports = AccountDashBoardConverter;
