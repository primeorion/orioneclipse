"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var utilDao = require('dao/util/UtilDao.js');
var userFirmEntity = require("entity/user/UserFirm.js");

var LogInDao = function () { }

LogInDao.prototype.getUserFirm = function (data, cb) {
	var connection = baseDao.getCommonDBConnection(data);
	logger.debug("Get User Firm", data);

    var query = squel.select()
    .from(userFirmEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(userFirmEntity.columns.id,data.userId))
        .and(squelUtils.eql(userFirmEntity.columns.firmId,data.firmId))
    );
    query = query.toString();

    logger.debug("Get user firm Query"+query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        logger.info("info i got here is"+JSON.stringify(data));
        return cb(null, data);
    });
};

module.exports = LogInDao;   