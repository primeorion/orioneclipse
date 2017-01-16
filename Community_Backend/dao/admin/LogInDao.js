"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');

var utilDao = require('dao/util/UtilDao.js');


var LogInDao = function () { }

LogInDao.prototype.getUserFirm = function (data, cb) {
	var connection = baseDao.getCommonDBConnection(data);
	logger.debug("Get User Firm", data);
	var queryData = {
		userId: data.userId,
		firmId: data.firmId
	}
    var query = 'SELECT * from userFirm WHERE id = ? and firmId = ?';
    connection.query(query, [queryData.userId,queryData.firmId], function (err, data) {
        if (err) {
            return cb(err);
        }
        logger.info("info i got here is"+JSON.stringify(data));
        return cb(null, data);
    });
};

module.exports = LogInDao;   