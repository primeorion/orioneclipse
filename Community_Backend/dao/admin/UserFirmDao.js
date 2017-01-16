"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao.js');
var logger = require('helper/Logger.js')(moduleName);
var utilService = new (require('service/util/UtilService'))();
var UserFirmDao = function(){}

UserFirmDao.prototype.createUserFirm = function (data, cb) {
    var commonConnection = cache.get(data.reqId).common;
    logger.debug("User Firm object", moduleName, data);
    var currentDate = utilDao.getSystemDateTime(null);
    var queryData = {
        userId: data.userId,
        firmId: data.firmId||data.user.firmId,
        createdBy: utilService.getAuditUserId(data.user),
        createdDate: currentDate,
        editedDate: currentDate
    };
    var commonDbCreateUserFirmQuery = 'INSERT INTO userFirm SET ? ';
    commonConnection.query(commonDbCreateUserFirmQuery, queryData, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserFirmDao.prototype.updateUserFirm = function (data, cb) {
    var commonConnection = cache.get(data.reqId).common;
    logger.debug("User Firm object", moduleName, data);
    var queryData = {
        userId: data.userId,
        firmId: data.firmId,
        editedDate: utilDao.getSystemDateTime(null),
        editedBy: utilService.getAuditUserId(data.user)
    };
    var commonDbUpdateUserFirmQuery = 'UPDATE userFirm SET ? WHERE userId = ? ';
    commonConnection.query(commonDbUpdateUserFirmQuery, [queryData, queryData.userId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

module.exports = UserFirmDao;   