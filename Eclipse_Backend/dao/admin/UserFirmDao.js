"use strict";

var moduleName = __filename;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var cache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao.js');
var logger = require('helper/Logger.js')(moduleName);
var utilService = new (require('service/util/UtilService'))();
var userFirmEntity = require("entity/user/UserFirm.js");
var UserFirmDao = function(){}

UserFirmDao.prototype.createUserFirm = function (data, cb) {
    var commonConnection = cache.get(data.reqId).common;
    logger.debug("User Firm object",data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[userFirmEntity.columns.userId] = data.userId;
    queryData[userFirmEntity.columns.firmId] = data.firmId||data.user.firmId;
    queryData[userFirmEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[userFirmEntity.columns.createdDate] = currentDate;
    queryData[userFirmEntity.columns.editedDate] = currentDate;

    var query = 'INSERT INTO '+userFirmEntity.tableName+' SET ? ';

    logger.debug("Create user firm Query"+query);
    commonConnection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserFirmDao.prototype.updateUserFirm = function (data, cb) {
    var commonConnection = cache.get(data.reqId).common;
    logger.debug("User Firm object", moduleName, data);

    var queryData = {};
    queryData[userFirmEntity.columns.userId] = data.userId;
    queryData[userFirmEntity.columns.firmId] = data.firmId;
    queryData[userFirmEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[userFirmEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = [];
    query.push(' UPDATE '+userFirmEntity.tableName+' SET ? ');
    query.push(' WHERE '+userFirmEntity.columns.userId+' = ? ');
    query = query.join(" ");

    logger.debug("Update user firm Query"+query);
    commonConnection.query(query, [queryData, data.userId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

module.exports = UserFirmDao;   