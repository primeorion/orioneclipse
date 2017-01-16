"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var AccountDashBoardDao = function () { }

AccountDashBoardDao.prototype.getSummary = function (data, cb) {

    var value = {
        total: 200,
        changeValueAmount: 150,
        changeValuePercent: 10,
        status  : "high"
    };
    var accounts = {
        total: 200,
        existing: 150,
        new: 50
    };

    var issues = {
        total: 235,
        errors: 16,
        warnings: 69
    };
    
     var bar={
         systematic : 160,
         accountWithMergeIn :100,
         accountWithMergeOut : 50,
         newAccount :  40,
         accountWithNoPortfolio : 160,
         toDo :144,    
         sma :  123,  
         accountWithDataError :102,
         accountWithPedingTrades :258
   
     }
    var summary = {
        dateTime: "2016-05-29",
        value: value,
        accounts: accounts,
        issues: issues,
        bars: bar,
    };

    return cb(null, summary);
}

module.exports = AccountDashBoardDao;
