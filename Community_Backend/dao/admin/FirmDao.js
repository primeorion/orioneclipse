"use strict";

var moduleName = __filename;
var localCache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');


var FirmDao = function () {}

FirmDao.prototype.getDefaultFirmIdUsingConnectUserId = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    var query = "SELECT * FROM userFirm WHERE orionConnectExternalId = ? "
    if(data.firmId){
       query =  query.concat(" and firmId = ? ");
    }else{
        query = query.concat(" and isDefault = 1 ");
    }
    logger.debug("Query: " + query + ", userId: " + data.orionUserId + ", isDefault: " + 1);
    connection.query(query,[data.orionUserId, data.firmId], function (err, userFirm) {
        if (err) {
            logger.error(moduleName, err);
            return cb(err);
        }
        return cb(null, !!userFirm[0] ? userFirm[0] : null);
    });
};

FirmDao.prototype.get = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    var firm = {
        id: data.firmId || data.defaultFirm
    };
    var firmSelectQuery = 'SELECT * from firm WHERE orionEclipseFirmId = ?';
    logger.debug("Query: " + firmSelectQuery + ", firmId: " + firm.id);
    connection.query(firmSelectQuery, [firm.id], function (err, resultSet) {
        if (err) {
        	logger.error(moduleName, err);
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
FirmDao.prototype.getEclipseFirm = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    var firm = {
        id: data.firmId || data.defaultFirm
    };
    var firmSelectQuery = 'SELECT * from orionEclipseFirm WHERE id = ?';
    logger.debug("Query: " + firmSelectQuery + ", firmId: " + firm.id);
    connection.query(firmSelectQuery, [firm.id], function (err, resultSet) {
        if (err) {
            logger.error(moduleName, err);
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

module.exports = FirmDao;
