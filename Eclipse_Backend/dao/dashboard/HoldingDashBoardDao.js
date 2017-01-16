"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var HoldingDashBoardDao = function () { }

HoldingDashBoardDao.prototype.getSummary1 = function (data, cb) {

    var value = {
        total: 200,
        changeValueAmount: 150,
        changeValuePercent: 10,
        status: "high"
    };
    var holdings = {
        total: 200,
        existing: 150,
        new: 50
    };

    var issues = {
        total: 235,
        errors: 16,
        warnings: 69
    };

    var bar = {
        all: 160,
        exclude: 100,
        notInModel: 50

    }

    var holdings1 = {
        holdingName: "Apple",
        marketValue: 1000,
        unit: 50,
        price: 50,
        percentage: 8
    }
    var holdings2 = {
        holdingName: "Intel",
        marketValue: 8000,
        unit: 800,
        price: 50,
        percentage: 8
    }
    var holdingsList = [];
    holdingsList.push(holdings1);
    holdingsList.push(holdings2);


    var holdingValue = {
        totalHoldingValue: 500010,
        totalHoldingValueStatus: "High",
        holdings: holdingsList
    };

    var summary = {
        dateTime: "2016-05-29",
        value: value,
        holdings: holdings,
        issues: issues,
        bars: bar,
        top10holdings: holdingValue
    };

    return cb(null, summary);
}

HoldingDashBoardDao.prototype.getSummaryByPortfolioId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    connection.query("CALL getHoldingDashboardByPortfolioId(?)", [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result) {
            return cb(null, result);

        }
        return cb("Unable to fetch HoldingList Data in Dao (getSummaryByPortfolioId()) ", result[0]);
    });
};


HoldingDashBoardDao.prototype.getSummaryByAccountId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    connection.query("CALL getHoldingDashboardByAccountId(?)", [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result) {
            return cb(null, result);

        }
        return cb("Unable to fetch HoldingList Data in Dao (getSummaryByAccountId()) ", result[0]);
    });
};

module.exports = HoldingDashBoardDao;
