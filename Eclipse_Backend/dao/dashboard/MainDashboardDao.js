"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var config = require('config');
var applicationEnum = config.applicationEnum;
var utilService = new (require('service/util/UtilService'))();

var MainDashboardDao = function () { }

MainDashboardDao.prototype.getSummary = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = data.user.userId;
    connection.query("CALL getOverviewDashBoardByUser (?)", [userId], function (err, result) {
        if (err) {
            return cb(err);
        }
        console.log("in dao"+JSON.stringify(result)+userId);
        return cb(null, result);
    });
}

MainDashboardDao.prototype.getEtlMetaInfo = function(data, cb){
	logger.debug("Get Etl meta info service called (getEtlMetaInfo())");
	var connection = baseDao.getCommonDBConnection(data);

	var query = [];
	query.push("Select * from statcatcher order By moment DESC limit 1");
	query = query.join("");

	connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });

}
MainDashboardDao.prototype.getAutoImportPreference = function(data, cb){
    logger.debug("data i got here is "+JSON.stringify(data));
    var connection = baseDao.getConnection(data);
    var userId = data.user.userId;
    var firmId = data.user.firmId;
    var autoImport = applicationEnum.preferences.AUTO_IMPORT;
    var firmLevelId = applicationEnum.preferenceLevel.FIRM;
    var query = "CALL getGeneralPreferenceValueForPreferenceLevel(?,?,?,?)";

    connection.query(query,[autoImport, firmLevelId, firmId, userId], function (err, result) {
        if (err) {
            logger.error("Error get info"+err);
            return cb(err);
        }
        return cb(null, result);
    });
}

module.exports = MainDashboardDao;