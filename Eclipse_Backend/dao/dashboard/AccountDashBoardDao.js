"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var AccountDashBoardDao = function () { }
var utilService = new (require('service/util/UtilService'))();

AccountDashBoardDao.prototype.getSummary = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);

    connection.query("CALL getAccountDashboardSummary(?)", [userId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result) {
            return cb(null, result);
        } else {
            return cb("Unable to fetch Account dashboard  Data in Dao (getAccountList()) ", result[0]);
        }
    });
};
module.exports = AccountDashBoardDao;
