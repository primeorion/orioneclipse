"use strict";

var moduleName = __filename;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var localCache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var userFirmEntity = require("entity/user/UserFirm.js");
var firmEntity = require("entity/firm/Firm.js");
var orionEclipseFirmEntity = require("entity/firm/OrionEclipseFirm.js");
var FirmDao = function () {}

FirmDao.prototype.getDefaultFirmIdUsingConnectUserId = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);

    var query = squel.select()
    .from(userFirmEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(userFirmEntity.columns.orionConnectExternalId,data.orionUserId))
    );
    if(data.firmId){
       query.where(squel.expr()
            .and(squelUtils.eql(userFirmEntity.columns.firmId,data.firmId))
        );
    }else{
        query.where(squel.expr()
            .and(squelUtils.eql(userFirmEntity.columns.isDefault,1))
        );
    }
    query = query.toString();

    logger.debug("Get user default firm Query"+query);
    connection.query(query, function (err, userFirm) {
        if (err) {
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

    var query = squel.select()
    .from(firmEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(firmEntity.columns.orionEclipseFirmId,firm.id))
    );
    query = query.toString();

    logger.debug("Get firm Query"+query);
    connection.query(query, function (err, resultSet) {
        if (err) {
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

    var query = squel.select()
    .from(orionEclipseFirmEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(orionEclipseFirmEntity.columns.id,firm.id))
    );
    query = query.toString();

    logger.debug("Get eclipse firm Query"+query);
    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error(moduleName, err);
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
FirmDao.prototype.saveProfile = function(data, cb){
    var connection = baseDao.getCommonDBConnection(data);
    console.log(JSON.stringify(data));
    var queryData = {};
    if(data.url){
        queryData[orionEclipseFirmEntity.columns.path] = data.url;
    }
    if(data.name){
        queryData[orionEclipseFirmEntity.columns.name] = data.name;
    }


    var query = [];
    query.push("Update "+orionEclipseFirmEntity.tableName+" SET ? ");
    query.push("Where "+orionEclipseFirmEntity.columns.id+" = ? ");

    query = query.join("");
    
    var final = connection.query(query,[queryData,data.user.firmId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
    logger.debug("Save profile query is"+final.sql);
}
FirmDao.prototype.getProfile = function(data, cb){
    var connection = baseDao.getCommonDBConnection(data);

    var query = squel.select()
    .field(orionEclipseFirmEntity.columns.id,"id")
    .field(orionEclipseFirmEntity.columns.name,"name")
    .field(orionEclipseFirmEntity.columns.path,"imagePath")
    .from(orionEclipseFirmEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(orionEclipseFirmEntity.columns.id,data.user.firmId))
    );
    query = query.toString();
    logger.debug("Get Log in user's firm profile Query = "+query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result[0]);
    });
}
module.exports = FirmDao;
