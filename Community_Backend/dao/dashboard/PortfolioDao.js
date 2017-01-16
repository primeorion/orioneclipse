"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var PortfolioDao = function () {}

PortfolioDao.prototype.getSummary = function (data, cb) {
    
    var portfolio = {
        total : 200,
        existing : 150,
        new : 50
    };
    var AUM = {
        total : 284,
        changeValue : 40,
        changePercent : 3,
        status  : "high"
    };
    var issues = {
        total : 235,
        errors : 16,
        warnings : 69
    };
    var summary = {
        portfolio : portfolio,
        AUM : AUM,
        issues : issues,
        outOfTolerance : 50,
        cashNeed : 87,
        setForAutoRebalance : 41,
        contributions : 29,
        distribution : 54,
        noModel : 5,
        blocked : 34,
        TLHOpportunity : 76,
        dataErrors : 25,
        pendingTrades : 65,
        isDeleted: 0,
        createdOn: "2016-09-02 12:21:39",
        createdBy: "ETL ETL",
        editedOn: "2016-09-02 12:21:39",
        editedBy: "ETL ETL" 
    };

    return cb(null, summary);
}

module.exports = PortfolioDao;