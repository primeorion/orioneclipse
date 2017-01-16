"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilService = new (require('service/util/UtilService'))();

var PortfolioDao = function () { }

PortfolioDao.prototype.getSummary = function (data, cb) {
    var connection = baseDao.getConnection(data);
    // var userId = utilService.getAuditUserId(data.user);

    connection.query("CALL getDashboardSummaryPortfolios (?, '2016-09-02 12:21:39')", data.user.userId, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

module.exports = PortfolioDao;